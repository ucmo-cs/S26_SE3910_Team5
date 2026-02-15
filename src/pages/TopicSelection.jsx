// src/pages/TopicSelection.jsx
import { useState, useEffect } from 'react';
import TopicCard from '../components/TopicCard';

const topics = [
    { id: 'checking', title: 'Checking Account' },
    { id: 'savings', title: 'Savings Account' },
    { id: 'cds', title: 'CDs/Money Market' },
    { id: 'student', title: 'Student Banking' },
    { id: 'auto', title: 'Auto Loans' },
    { id: 'home', title: 'Home Equity' },
    { id: 'mortgage', title: 'Mortgage' },
    { id: 'credit', title: 'Credit Card' },
];

export default function TopicSelection({onUpdate, onContinue }) {
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        onUpdate(selected);
    }, [selected]);

    const toggleTopic = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>What can we help you with?</h1>
                <p className="subtitle">Choose as many topics as you need.</p>
            </header>

            <div className="topics-grid">
                {topics.map(topic => (
                    <TopicCard
                        key={topic.id}
                        id={topic.id}
                        title={topic.title}
                        selected={selected.includes(topic.id)}
                        onClick={toggleTopic}
                    />
                ))}
            </div>

            <div className="note-section">
                <label htmlFor="note">Add a note</label>
                <textarea
                    id="note"
                    rows={3}
                    placeholder="Enter any additional details..."
                />
            </div>

            <button
                className="continue-btn"
                onClick={onContinue}
                disabled={selected.length === 0}
            >
                Continue
            </button>
        </div>
    );
}