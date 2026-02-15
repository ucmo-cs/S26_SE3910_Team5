// src/pages/ContactDetails.jsx
import { useState } from 'react';

export default function ContactDetails({ onUpdate, onContinue }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        textConsent: false,
        emailConsent: false
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Required';
        if (!formData.email.trim()) {
            newErrors.email = 'Required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onUpdate(formData); // <-- PASS DATA UP
            onContinue();       // <-- THEN ADVANCE
        }
    };

    const inputStyle = (error) => ({
        padding: '10px 12px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '3px',
        fontSize: '14px',
        fontFamily: 'inherit',
        width: '100%'
    });

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 400, marginBottom: '24px' }}>
                Now we just need a few more details.
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            style={inputStyle(errors.firstName)}
                        />
                        {errors.firstName && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.firstName}</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            style={inputStyle(errors.lastName)}
                        />
                        {errors.lastName && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.lastName}</span>}
                    </div>
                </div>

                {/* Contact Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle(errors.email)}
                        />
                        {errors.email && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.email}</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="(xxx)-xxx-xxxx"
                            value={formData.phone}
                            onChange={handleChange}
                            style={inputStyle(errors.phone)}
                        />
                        {errors.phone && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.phone}</span>}
                    </div>
                </div>

                {/* Consent Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="textConsent"
                            checked={formData.textConsent}
                            onChange={handleChange}
                            style={{ marginTop: '2px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                Text Message Consent
                            </strong>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                By checking, I'm providing my consent to receive text updates.
              </span>
                        </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="emailConsent"
                            checked={formData.emailConsent}
                            onChange={handleChange}
                            style={{ marginTop: '2px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                Email Consent
                            </strong>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                By checking, I'm providing my consent to receive email updates.
              </span>
                        </div>
                    </label>
                </div>

                <button
                    onClick={handleSubmit}
                    style={{
                        background: '#0891b2',
                        color: 'white',
                        border: 'none',
                        padding: '10px 28px',
                        borderRadius: '3px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        marginTop: '8px'
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}