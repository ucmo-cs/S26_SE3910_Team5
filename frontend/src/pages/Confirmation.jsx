// src/pages/Confirmation.jsx
import { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { getTopicIconComponent } from '../constants/topicIcons';

const APPOINTMENTS_API_URL = 'http://localhost:8080/appointments';
const TIMESLOTS_API_URL = 'http://localhost:8080/timeslots';
const SLOT_INCREMENT_MINUTES = 30;

export default function Confirmation({ formData, onEdit, onCancel }) {
    const { topics, location, dateTime, contact } = formData;
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const missing = [];
    if (!contact) missing.push('Contact Info');
    if (!location) missing.push('Location');
    if (!dateTime) missing.push('Date/Time');

    if (missing.length > 0) {
        return (
            <div className="confirmation-container">
                <h1>Missing Information</h1>
                <p>Please complete: {missing.join(', ')}</p>
                <button type="button" className="continue-btn" onClick={onEdit}>
                    Go Back to Edit
                </button>
            </div>
        );
    }

    const displayName = `${contact.firstName} ${contact.lastName}`;

    const formatTopic = (topicId) => {
        const topicMap = {
            checking: 'Checking Account',
            savings: 'Savings Account',
            cds: 'CDs/Money Market',
            'student-banking': 'Student Banking',
            student: 'Student Banking',
            auto: 'Auto Loans',
            'home-equity': 'Home Equity',
            mortgage: 'Mortgage',
            'credit-card': 'Credit Card',
            credit: 'Credit Card',
            retirement: 'Retirement Savings',
            investment: 'Investment Account',
            home: 'Home Equity',
            other: 'Other',
        };
        return topicMap[topicId] || topicId;
    };

    const findMatchingTimeSlot = (timeSlots, branchId, slotStartMs) => {
        if (!Array.isArray(timeSlots)) {
            return null;
        }

        return timeSlots.find((timeSlot) => {
            const candidateBranchId = Number(timeSlot?.branch?.branchId);
            const candidateStartMs = new Date(timeSlot?.startTime).getTime();
            return candidateBranchId === branchId && candidateStartMs === slotStartMs;
        }) || null;
    };

    const resolveTimeSlotId = async ({ branchId, isoStart, isoEnd }) => {
        const slotStartMs = new Date(isoStart).getTime();

        const listResponse = await fetch(TIMESLOTS_API_URL, {
            method: 'GET',
        });

        if (!listResponse.ok) {
            throw new Error(`Unable to load time slots (${listResponse.status}).`);
        }

        const existingTimeSlots = await listResponse.json();
        const existingMatch = findMatchingTimeSlot(existingTimeSlots, branchId, slotStartMs);
        if (existingMatch?.timeSlotId) {
            return existingMatch.timeSlotId;
        }

        const createResponse = await fetch(TIMESLOTS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branch: { branchId },
                startTime: isoStart,
                endTime: isoEnd,
                isAvailable: true,
            }),
        });

        if (createResponse.ok) {
            const createdSlot = await createResponse.json();
            if (createdSlot?.timeSlotId) {
                return createdSlot.timeSlotId;
            }
        }

        // Handle race conditions where another client created the slot first.
        const retryListResponse = await fetch(TIMESLOTS_API_URL, {
            method: 'GET',
        });

        if (!retryListResponse.ok) {
            throw new Error(`Unable to resolve selected time slot (${retryListResponse.status}).`);
        }

        const retryTimeSlots = await retryListResponse.json();
        const retryMatch = findMatchingTimeSlot(retryTimeSlots, branchId, slotStartMs);
        if (retryMatch?.timeSlotId) {
            return retryMatch.timeSlotId;
        }

        throw new Error(`Unable to create selected time slot (${createResponse.status}).`);
    };

    const handleConfirmAppointment = async () => {
        setSubmitError('');

        const userId = Number(contact?.userId);
        const branchId = Number(location?.branchId ?? dateTime?.branchId);
        const selectedIsoStart = dateTime?.isoStart;

        if (!Number.isInteger(userId) || userId <= 0) {
            setSubmitError('Contact details are missing. Please complete contact information again.');
            return;
        }

        if (!Number.isInteger(branchId) || branchId <= 0) {
            setSubmitError('Selected location is missing. Please choose a location again.');
            return;
        }

        const parsedStart = new Date(selectedIsoStart);
        if (!selectedIsoStart || Number.isNaN(parsedStart.getTime())) {
            setSubmitError('Selected appointment time is missing. Please pick a time slot again.');
            return;
        }

        const parsedEnd = new Date(dateTime?.isoEnd);
        const isoStart = parsedStart.toISOString();
        const isoEnd = Number.isNaN(parsedEnd.getTime())
            ? new Date(parsedStart.getTime() + SLOT_INCREMENT_MINUTES * 60 * 1000).toISOString()
            : parsedEnd.toISOString();

        try {
            setIsSubmitting(true);
            const selectedTopics = formData.topics.join(', ');
            const resolvedTimeSlotId = await resolveTimeSlotId({
                branchId,
                isoStart,
                isoEnd,
            });

            const response = await fetch(APPOINTMENTS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        userId,
                    },
                    timeSlot: {
                        timeSlotId: resolvedTimeSlotId,
                    },
                    type: selectedTopics,
                    status: 'booked',
                }),
            });

            if (!response.ok) {
                throw new Error(`Could not create appointment (${response.status}).`);
            }

            const savedAppointment = await response.json();
            console.log('Appointment saved:', savedAppointment);
            alert('Appointment confirmed!');
        } catch (error) {
            console.error('Error creating appointment:', error);
            setSubmitError(error?.message || 'Could not complete appointment booking.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const topicItems =
        topics.length > 0
            ? topics.map((id) => ({ id, label: formatTopic(id) }))
            : [{ id: 'default', label: 'Banking Service' }];

    const locationLine = [location.address, location.city].filter(Boolean).join(', ');

    return (
        <div className="confirmation-container">
            <header className="confirmation-header">
                <h1>Here&apos;s your appointment:</h1>
            </header>

            <div className="confirmation-greeting">
                <p className="greeting-name">{displayName},</p>
                <p className="greeting-message">Your appointment is scheduled. We&apos;ll see you soon!</p>
            </div>

            <div className="confirmation-details">
                <div className="detail-row">
                    <div className="detail-icon" aria-hidden>
                        <MapPin size={22} strokeWidth={1.5} />
                    </div>
                    <div className="detail-content">
                        <p className="detail-text">{locationLine}</p>
                        <a href="#" className="detail-link">
                            Open in Maps
                        </a>
                    </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-row">
                    <div className="detail-icon" aria-hidden>
                        <Calendar size={22} strokeWidth={1.5} />
                    </div>
                    <div className="detail-content">
                        <p className="detail-text">{dateTime.date}</p>
                        <p className="detail-subtext">{dateTime.time}</p>
                        <a href="#" className="detail-link">
                            Add to Calendar
                        </a>
                    </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-row confirmation-detail-row--topics">
                    <div className="detail-content">
                        <ul className="confirmation-topic-list">
                            {topicItems.map(({ id, label }, index) => {
                                const IconComponent = getTopicIconComponent(id);
                                return (
                                    <li key={`${id}-${index}`} className="confirmation-topic-item">
                                        <span className="confirmation-topic-icon" aria-hidden>
                                            <IconComponent size={20} strokeWidth={1.5} />
                                        </span>
                                        <span className="confirmation-topic-label">{label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="confirmation-actions">
                {submitError && (
                    <p style={{ color: '#b91c1c', marginBottom: '10px' }}>{submitError}</p>
                )}
                <button type="button" className="btn-edit" onClick={onEdit}>
                    Edit Appointment
                </button>
                 <button type="button" className="btn-confirm" onClick={handleConfirmAppointment} disabled={isSubmitting}>
                    {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Cancel Appointment
                </button>
            </div>
        </div>
    );
}
