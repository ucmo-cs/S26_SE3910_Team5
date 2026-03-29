// src/pages/Confirmation.jsx
import { MapPin, Calendar } from 'lucide-react';
import { getTopicIconComponent } from '../constants/topicIcons';

export default function Confirmation({ formData, onEdit, onCancel }) {
    const { topics, location, dateTime, contact } = formData;

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
                <button type="button" className="btn-edit" onClick={onEdit}>
                    Edit Appointment
                </button>
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Cancel Appointment
                </button>
            </div>
        </div>
    );
}
