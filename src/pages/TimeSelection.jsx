// src/pages/TimeSelection.jsx
import { useState } from 'react';
import { Calendar, Search } from 'lucide-react';

const availabilityData = [
    {
        date: 'Friday, 24th of August',
        slots: [
            { time: '9:00 AM', available: false },
            { time: '10:00 AM', available: true },
            { time: '11:00 AM', available: false },
            { time: '12:00 PM', available: true },
            { time: '1:00 PM', available: true },
            { time: '2:00 PM', available: true },
            { time: '3:00 PM', available: false },
        ]
    },
    {
        date: 'Saturday, 25th of August',
        slots: [
            { time: '10:00 AM', available: false },
            { time: '11:00 AM', available: true },
        ]
    },
    {
        date: 'Monday, 27th of August',
        slots: [
            { time: '9:00 AM', available: true },
            { time: '10:00 AM', available: true },
            { time: '11:00 AM', available: true },
            { time: '12:00 PM', available: false },
            { time: '1:00 PM', available: false },
            { time: '2:00 PM', available: true },
            { time: '3:00 PM', available: true },
        ]
    }
];

export default function TimeSelection({ onUpdate, onContinue }) {
    const [selectedTime, setSelectedTime] = useState( null);

    const handleSelect = (date, time) => {
        if (!time.available) return;

        const selection = { date, time: time.time };
        setSelectedTime(selection);
        onUpdate(selection); // Save immediately
    };

    const handleContinue = () => {
        if (selectedTime) {
            onContinue();
        }
    };

    const isSelected = (date, timeStr) => {
        return selectedTime && selectedTime.date === date && selectedTime.time === timeStr;
    };

    return (
        <div style={{ maxWidth: '520px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 400, marginBottom: '20px' }}>
                Let's find a time that works for you.
            </h1>

            <div style={{ display: 'flex', marginBottom: '30px', maxWidth: '300px' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', border: '1px solid #d1d5db', borderRight: 'none',
                    borderRadius: '2px 0 0 2px', background: 'white'
                }}>
                    <Calendar size={18} />
                    <input
                        type="text"
                        placeholder="CHOOSE DATE"
                        readOnly
                        style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', width: '100%' }}
                    />
                </div>
                <button style={{
                    width: '40px', background: '#0891b2', border: '1px solid #0891b2',
                    borderRadius: '0 2px 2px 0', color: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
                    <Search size={18} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                {availabilityData.map((day) => (
                    <div key={day.date}>
                        <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#9ca3af', marginBottom: '10px' }}>
                            {day.date}
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {day.slots.map((slot) => {
                                const selected = isSelected(day.date, slot.time);

                                const buttonStyle = {
                                    padding: '8px 0',
                                    width: '86px',
                                    border: '1px solid transparent',
                                    borderRadius: '3px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    cursor: slot.available ? 'pointer' : 'not-allowed',
                                    fontFamily: 'inherit',
                                    background: slot.available
                                        ? (selected ? '#65a30d' : 'white')
                                        : '#f3f4f6',
                                    borderColor: slot.available
                                        ? (selected ? '#65a30d' : '#e5e7eb')
                                        : '#f3f4f6',
                                    color: slot.available
                                        ? (selected ? 'white' : '#374151')
                                        : '#d1d5db',
                                };

                                return (
                                    <button
                                        key={slot.time}
                                        style={buttonStyle}
                                        onClick={() => handleSelect(day.date, slot)}
                                        disabled={!slot.available}
                                    >
                                        {slot.time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleContinue}
                disabled={!selectedTime}
                style={{
                    background: selectedTime ? '#0891b2' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    padding: '10px 28px',
                    borderRadius: '3px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: selectedTime ? 'pointer' : 'not-allowed'
                }}
            >
                Continue
            </button>
        </div>
    );
}