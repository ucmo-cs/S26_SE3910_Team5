// src/pages/LocationStep.jsx
import { useState } from 'react';
import { MapPin } from 'lucide-react';

const mockLocations = [
    { id: 1, address: '1000 Walnut', city: 'Kansas City, MO 64106', distance: '0.5 miles', appointments: 20 },
    { id: 2, address: '922 Walnut St', city: 'Kansas City, MO 64106', distance: '2.1 miles', appointments: 12 },
    { id: 3, address: '4800 Main St', city: 'Kansas City, MO 64112', distance: '3.4 miles', appointments: 8 }
];

export default function LocationStep({ selectedLocation, onUpdate, onContinue }) {
    const [selected, setSelected] = useState(selectedLocation?.id || null);
    const [zipCode, setZipCode] = useState('');
    const [hasSearched, setHasSearched] = useState(true);

    const handleSelect = (location) => {
        setSelected(location.id);
        onUpdate(location);
    };

    return (
        <div className="location-step-container">
            <header className="page-header">
                <h1>Which location works best for you?</h1>
                <p className="subtitle">Enter your ZIP code to find nearby branches.</p>
            </header>

            {/* Search Bar */}
            <div className="location-search-bar">
                <input
                    type="text"
                    placeholder="ZIP CODE"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="zip-input"
                    maxLength="5"
                />
                <button className="search-btn" onClick={() => setHasSearched(true)}>
                    Search
                </button>
            </div>

            {/* Map and Results */}
            {hasSearched && (
                <div className="location-results">
                    {/* Map Placeholder */}
                    <div className="map-container">
                        <div className="map-placeholder map-fallback">
                            <div className="map-pin-marker">
                                <div className="pin-popup">
                                    <strong>Commerce Bank</strong>
                                    <p>922 Walnut St<br/>Kansas City, MO 64106</p>
                                </div>
                                <div className="pin-point"></div>
                            </div>
                        </div>
                    </div>

                    {/* Location List */}
                    <div className="locations-list">
                        {mockLocations.map((location) => (
                            <div key={location.id} className="location-card">
                                <div className="location-main">
                                    <div className="location-icon">
                                        <MapPin size={32} strokeWidth={1.5} />
                                    </div>

                                    <div className="location-details">
                                        <div className="location-header">
                                            <div className="location-address-block">
                                                <h3>{location.address}</h3>
                                                <p className="location-city">{location.city}</p>
                                                <p className="location-appointments">
                                                    {location.appointments} available appointments in the next week
                                                </p>
                                            </div>
                                            <span className="location-distance">{location.distance}</span>
                                        </div>

                                        <button
                                            className={`select-location-btn ${selected === location.id ? 'selected' : ''}`}
                                            onClick={() => handleSelect(location)}
                                        >
                                            {selected === location.id ? 'Selected' : 'Select Location'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selected && (
                        <button className="continue-btn" onClick={onContinue} style={{ marginTop: '32px' }}>
                            Continue
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}