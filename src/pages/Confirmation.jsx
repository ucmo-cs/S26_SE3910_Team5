// src/pages/Confirmation.jsx
import { MapPin, Calendar, PiggyBank } from 'lucide-react';

export default function Confirmation({ formData, onEdit, onCancel }) {
    const { topics, location, dateTime, contact } = formData;

    console.log('Step 5 Data:', formData); // Debug log

    // Check what's missing
    const missing = [];
    if (!contact) missing.push('Contact Info');
    if (!location) missing.push('Location');
    if (!dateTime) missing.push('Date/Time');

    if (missing.length > 0) {
        return (
            <div className="confirmation-container">
                <h1>Missing Information</h1>
                <p>Please complete: {missing.join(', ')}</p>
                <button className="continue-btn" onClick={onEdit}>
                    Go Back to Edit
                </button>
            </div>
        );
    }

    const displayName = `${contact.firstName} ${contact.lastName}`;

    const formatTopic = (topicId) => {
        const topicMap = {
            'checking': 'Checking Account',
            'savings': 'Savings Account',
            'cds': 'CDs/Money Market',
            'student-banking': 'Student Banking',
            'auto': 'Auto Loans',
            'home-equity': 'Home Equity',
            'mortgage': 'Mortgage',
            'credit-card': 'Credit Card',
            'retirement': 'Retirement Savings',
            'investment': 'Investment Account'
        };
        return topicMap[topicId] || topicId;
    };

    const displayTopic = topics.length > 0 ? formatTopic(topics[0]) : 'Banking Service';

    return (
        <div className="confirmation-container">
            <header className="confirmation-header">
                <h1>Here's your appointment:</h1>
            </header>

            <div className="confirmation-greeting">
                <p className="greeting-name">{displayName},</p>
                <p className="greeting-message">Your appointment is scheduled. We'll see you soon!</p>
            </div>

            <div className="confirmation-details">
                <div className="detail-row">
                    <div className="detail-icon"><MapPin size={24} /></div>
                    <div className="detail-content">
                        <p className="detail-text">{location.address},<br/>{location.city}</p>
                        <a href="#" className="detail-link">Open in Maps</a>
                    </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-row">
                    <div className="detail-icon"><Calendar size={24} /></div>
                    <div className="detail-content">
                        <p className="detail-text">{dateTime.date}</p>
                        <p className="detail-subtext">{dateTime.time}</p>
                        <a href="#" className="detail-link">Add to Calendar</a>
                    </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-row">
                    <div className="detail-icon"><PiggyBank size={24} /></div>
                    <div className="detail-content">
                        <p className="detail-text">{displayTopic}</p>
                    </div>
                </div>
            </div>

            <div className="confirmation-actions">
                <button className="btn-edit" onClick={onEdit}>Edit Appointment</button>
                <button className="btn-cancel" onClick={onCancel}>Cancel Appointment</button>
            </div>
        </div>
    );
}