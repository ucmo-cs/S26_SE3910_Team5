// src/pages/LocationStep.jsx
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BRANCHES_API_URL = 'http://localhost:8080/branches';
const ZIP_LOOKUP_API_URL = 'https://api.zippopotam.us/us';
const IP_GEOLOOKUP_URL = 'https://ipapi.co/json/';
const ZIP_CODE_PATTERN = /^\d{5}$/;
const EARTH_RADIUS_MILES = 3958.8;
const GEOCODE_DELAY_MS = 250;
const RESULTS_BATCH_SIZE = 6;
const DEFAULT_MAP_CENTER = { latitude: 39.0997, longitude: -94.5786 };
const DEFAULT_MAP_ZOOM = 11;
const SELECTED_MAP_ZOOM = 13;
const SELECTED_MARKER_RADIUS = 11;
const UNSELECTED_MARKER_RADIUS = 8;
const TOPIC_LABELS = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    cds: 'CDs/Money Market',
    student: 'Student Banking',
    auto: 'Auto Loans',
    home: 'Home Equity',
    mortgage: 'Mortgage',
    credit: 'Credit Card',
    other: 'Other',
};

function deriveAddressParts(rawAddress) {
    const normalized = (rawAddress || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (normalized.length === 0) {
        return { address: 'Address unavailable', city: '' };
    }

    if (normalized.length === 1) {
        return { address: normalized[0], city: '' };
    }

    return {
        address: normalized[0],
        city: normalized.slice(1).join(', '),
    };
}

function normalizeTopicValue(value) {
    return String(value || '').trim().toLowerCase();
}

function parseBranchTypeSet(typesCsv) {
    return new Set(
        String(typesCsv || '')
            .split(',')
            .map(normalizeTopicValue)
            .filter(Boolean),
    );
}

function annotateTopicSupport(location, selectedTopics) {
    const selectedSet = new Set((selectedTopics || []).map(normalizeTopicValue).filter(Boolean));
    if (selectedSet.size === 0) {
        return {
            ...location,
            supportsSelectedTopics: true,
            missingTopics: [],
        };
    }

    const branchTypeSet = parseBranchTypeSet(location.types);
    const missingTopics = Array.from(selectedSet).filter((topic) => !branchTypeSet.has(topic));

    return {
        ...location,
        supportsSelectedTopics: missingTopics.length === 0,
        missingTopics,
    };
}

function prioritizeByTopicSupport(locations, selectedTopics) {
    const annotated = (locations || []).map((location) => annotateTopicSupport(location, selectedTopics));
    const supported = [];
    const unsupported = [];

    annotated.forEach((location) => {
        if (location.supportsSelectedTopics) {
            supported.push(location);
        } else {
            unsupported.push(location);
        }
    });

    return [...supported, ...unsupported];
}

function formatTopicLabel(topicId) {
    return TOPIC_LABELS[topicId] || topicId;
}

function formatMissingTopics(missingTopics) {
    const topics = (missingTopics || []).map(formatTopicLabel);
    return topics.join(', ');
}

function formatDistance(distanceMiles) {
    if (typeof distanceMiles !== 'number' || Number.isNaN(distanceMiles)) {
        return '--';
    }
    return `${distanceMiles.toFixed(1)} miles`;
}

function RecenterMap({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        map.setView([center.latitude, center.longitude], zoom, { animate: true });
    }, [map, center.latitude, center.longitude, zoom]);

    return null;
}

function haversineMiles(fromCoords, toCoords) {
    const toRadians = (value) => (value * Math.PI) / 180;
    const dLat = toRadians(toCoords.latitude - fromCoords.latitude);
    const dLon = toRadians(toCoords.longitude - fromCoords.longitude);
    const lat1 = toRadians(fromCoords.latitude);
    const lat2 = toRadians(toCoords.latitude);

    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_MILES * c;
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getApproximateZipFromIp(signal) {
    const response = await fetch(IP_GEOLOOKUP_URL, {
        method: 'GET',
        signal,
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        return '';
    }

    const payload = await response.json();
    const postal = String(payload?.postal || '').trim();
    return ZIP_CODE_PATTERN.test(postal) ? postal : '';
}

async function getZipCoordinates(zipCode, signal) {
    const response = await fetch(`${ZIP_LOOKUP_API_URL}/${zipCode}`, {
        method: 'GET',
        signal,
        headers: {
            Accept: 'application/json',
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`ZIP_LOOKUP_FAILED_${response.status}`);
    }

    const payload = await response.json();
    const latitude = Number(payload?.places?.[0]?.latitude);
    const longitude = Number(payload?.places?.[0]?.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return null;
    }

    return { latitude, longitude };
}

function mapBranchToLocation(branch) {
    const { address, city } = deriveAddressParts(branch.address);
    const zipMatch = String(branch.address || '').match(/\b\d{5}\b/);
    return {
        id: branch.branchId,
        address,
        city,
        distance: '--',
        appointments: '',
        branchId: branch.branchId,
        branchName: branch.branchName,
        fullAddress: branch.address || '',
        types: branch.types || '',
        latitude: null,
        longitude: null,
        distanceMiles: null,
        geocodeStatus: 'idle',
        zipCode: zipMatch ? zipMatch[0] : '',
    };
}

export default function LocationStep({ selectedLocation, selectedTopics, onUpdate, onContinue, showContinue }) {
    const [selected, setSelected] = useState(selectedLocation?.id || null);
    const [zipCode, setZipCode] = useState('');
    const [allLocations, setAllLocations] = useState([]);
    const [displayLocations, setDisplayLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [searchMessage, setSearchMessage] = useState('');
    const [visibleCount, setVisibleCount] = useState(RESULTS_BATCH_SIZE);
    const autoLocateRunRef = useRef(false);
    const addressGeocodeCacheRef = useRef(new Map());
    const visibleLocations = displayLocations.slice(0, visibleCount);
    const isRefreshingResults = searching && displayLocations.length > 0;
    const mappableLocations = visibleLocations.filter(
        (location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude),
    );
    const selectedMappableLocation = mappableLocations.find((location) => location.id === selected);
    const prioritizedMapLocation = selectedMappableLocation || mappableLocations[0] || null;
    const mapCenter = prioritizedMapLocation
        ? { latitude: prioritizedMapLocation.latitude, longitude: prioritizedMapLocation.longitude }
        : DEFAULT_MAP_CENTER;
    const mapZoom = selectedMappableLocation ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM;

    useEffect(() => {
        const controller = new AbortController();

        async function loadLocations() {
            try {
                setLoading(true);
                setLoadError('');

                const response = await fetch(BRANCHES_API_URL, {
                    method: 'GET',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Unable to load locations (${response.status})`);
                }

                const branches = await response.json();
                const mappedLocations = Array.isArray(branches) ? branches.map(mapBranchToLocation) : [];
                setAllLocations(mappedLocations);
                setDisplayLocations(prioritizeByTopicSupport(mappedLocations, selectedTopics));

                if (selectedLocation?.id) {
                    const stillExists = mappedLocations.some((location) => location.id === selectedLocation.id);
                    if (!stillExists) {
                        setSelected(null);
                    }
                }
            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    return;
                }
                setAllLocations([]);
                setDisplayLocations([]);
                setLoadError('Could not load locations from the server. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadLocations();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        setSelected(selectedLocation?.id || null);
    }, [selectedLocation?.id]);

    useEffect(() => {
        setDisplayLocations((previous) => prioritizeByTopicSupport(previous, selectedTopics));
    }, [selectedTopics]);

    useEffect(() => {
        if (selected === null) {
            return;
        }

        const selectedBranch = displayLocations.find((location) => location.id === selected);
        if (selectedBranch && !selectedBranch.supportsSelectedTopics) {
            setSelected(null);
            onUpdate(null);
        }
    }, [displayLocations, selected, onUpdate]);

    const rankLocationsFromOrigin = async (originCoordinates, locations) => {
        const addressCache = addressGeocodeCacheRef.current;
        const resolvedLocations = [];
        const unresolvedLocations = [];

        for (let index = 0; index < locations.length; index += 1) {
            const location = locations[index];
            const cacheKey = location.zipCode;

            if (!cacheKey) {
                unresolvedLocations.push(location);
                continue;
            }

            let branchCoordinates = addressCache.get(cacheKey);
            if (typeof branchCoordinates === 'undefined') {
                branchCoordinates = await getZipCoordinates(cacheKey, undefined);
                addressCache.set(cacheKey, branchCoordinates);
                if (index < locations.length - 1) {
                    await delay(GEOCODE_DELAY_MS);
                }
            }

            if (!branchCoordinates) {
                unresolvedLocations.push(location);
                continue;
            }

            const distanceMiles = haversineMiles(originCoordinates, branchCoordinates);
            resolvedLocations.push({
                ...location,
                latitude: branchCoordinates.latitude,
                longitude: branchCoordinates.longitude,
                distanceMiles,
                geocodeStatus: 'resolved',
                distance: formatDistance(distanceMiles),
            });
        }

        resolvedLocations.sort((a, b) => a.distanceMiles - b.distanceMiles);
        const rankedByDistance = [...resolvedLocations, ...unresolvedLocations];
        return { resolvedLocations, rankedLocations: prioritizeByTopicSupport(rankedByDistance, selectedTopics) };
    };

    useEffect(() => {
        if (autoLocateRunRef.current || allLocations.length === 0 || loading) {
            return;
        }

        autoLocateRunRef.current = true;

        async function rankByUserLocation() {
            setSearching(true);
            setSearchMessage('');
            setVisibleCount(RESULTS_BATCH_SIZE);

            try {
                const approximateZip = await getApproximateZipFromIp(undefined);
                if (!approximateZip) {
                    setDisplayLocations(allLocations);
                    setSearchMessage('Could not determine approximate location. Enter a ZIP code to search.');
                    return;
                }

                setZipCode(approximateZip);
                const approximateCoordinates = await getZipCoordinates(approximateZip, undefined);
                if (!approximateCoordinates) {
                    setDisplayLocations(allLocations);
                    setSearchMessage('Could not determine approximate location. Enter a ZIP code to search.');
                    return;
                }

                const { resolvedLocations, rankedLocations } = await rankLocationsFromOrigin(approximateCoordinates, allLocations);
                setDisplayLocations(rankedLocations);
                setVisibleCount(RESULTS_BATCH_SIZE);

                if (resolvedLocations.length === 0) {
                    setSearchMessage('Could not calculate distances from your approximate location.');
                } else {
                    setSearchMessage('');
                }

                if (selected !== null) {
                    const selectedBranch = rankedLocations.find((location) => location.id === selected);
                    if (!selectedBranch || !selectedBranch.supportsSelectedTopics) {
                        setSelected(null);
                        onUpdate(null);
                    }
                }
            } catch (locationError) {
                if (String(locationError.message || '').startsWith('ZIP_LOOKUP_FAILED_429')) {
                    setSearchMessage('Location lookup is temporarily rate-limited.');
                } else {
                    setSearchMessage('Could not determine nearby branches from your approximate location.');
                }
                setDisplayLocations(allLocations);
                setVisibleCount(RESULTS_BATCH_SIZE);
            } finally {
                setSearching(false);
            }
        }

        rankByUserLocation();
    }, [allLocations, loading, onUpdate, selected]);

    const handleSelect = (location) => {
        if (!location.supportsSelectedTopics) {
            return;
        }
        setSelected(location.id);
        onUpdate(location);
    };

    const handleZipSearch = async () => {
        const trimmedZip = zipCode.trim();
        if (!ZIP_CODE_PATTERN.test(trimmedZip)) {
            setSearchMessage('ZIP search failed: please enter a valid 5-digit ZIP code.');
            return;
        }

        if (allLocations.length === 0) {
            setSearchMessage('ZIP search failed: no locations available.');
            return;
        }

        setSearching(true);
        setSearchMessage('');
        setVisibleCount(RESULTS_BATCH_SIZE);

        try {
            const zipCoordinates = await getZipCoordinates(trimmedZip, undefined);
            if (!zipCoordinates) {
                setSearchMessage('ZIP search failed: unable to locate that ZIP code.');
                return;
            }

            const { resolvedLocations, rankedLocations } = await rankLocationsFromOrigin(zipCoordinates, allLocations);
            setDisplayLocations(rankedLocations);
            setVisibleCount(RESULTS_BATCH_SIZE);

            if (resolvedLocations.length === 0) {
                setSearchMessage('ZIP search failed: could not calculate distances.');
            }

            if (selected !== null) {
                const selectedBranch = rankedLocations.find((location) => location.id === selected);
                if (!selectedBranch || !selectedBranch.supportsSelectedTopics) {
                    setSelected(null);
                    onUpdate(null);
                }
            }
        } catch (searchError) {
            if (String(searchError.message || '').startsWith('ZIP_LOOKUP_FAILED_429')) {
                setSearchMessage('ZIP search failed: lookup is temporarily rate-limited.');
            } else {
                setSearchMessage('ZIP search failed.');
            }
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="location-step-container">
            <header className="page-header">
                <h1>Which location works best for you?</h1>
                <p className="subtitle">Showing nearby branches based on your location. You can also search by ZIP.</p>
            </header>

            <div className="map-full-bleed">
                <div className="map-container">
                    <MapContainer
                        center={[mapCenter.latitude, mapCenter.longitude]}
                        zoom={mapZoom}
                        scrollWheelZoom
                        className="leaflet-map"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap center={mapCenter} zoom={mapZoom} />

                        {mappableLocations.map((location) => {
                            const isSelected = location.id === selected;
                            return (
                                <CircleMarker
                                    key={location.id}
                                    center={[location.latitude, location.longitude]}
                                    radius={isSelected ? SELECTED_MARKER_RADIUS : UNSELECTED_MARKER_RADIUS}
                                    pathOptions={{
                                        color: isSelected ? '#0f766e' : '#0891b2',
                                        fillColor: isSelected ? '#14b8a6' : '#06b6d4',
                                        fillOpacity: 0.9,
                                        weight: isSelected ? 3 : 2,
                                    }}
                                    eventHandlers={{
                                        click: () => handleSelect(location),
                                    }}
                                >
                                    <Popup>
                                        <strong>{location.branchName || location.address}</strong>
                                        <p>{[location.address, location.city].filter(Boolean).join(', ')}</p>
                                        <p>{location.distance}</p>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>

                    {!loading && mappableLocations.length === 0 && (
                        <div className="map-status-overlay">
                            Loading...
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="location-search-bar">
                <input
                    type="text"
                    placeholder="ZIP CODE"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && !searching && allLocations.length > 0) {
                            e.preventDefault();
                            handleZipSearch();
                        }
                    }}
                    className="zip-input"
                    maxLength="5"
                />
                <button
                    type="button"
                    className="search-btn"
                    onClick={handleZipSearch}
                    disabled={loading || searching || allLocations.length === 0}
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Results */}
            <div className="location-results">
                <div className="locations-list-shell">
                    {/* Location List */}
                    <div className={`locations-list ${isRefreshingResults ? 'results-refreshing' : ''}`.trim()}>
                        {loading && <p className="location-city">Loading locations...</p>}

                        {!loading && searching && <p className="location-city">Searching locations...</p>}

                        {!loading && loadError && <p className="location-city">{loadError}</p>}

                        {!loading && !loadError && searchMessage && (
                            <p className="location-city">{searchMessage}</p>
                        )}

                        {!loading && !loadError && visibleLocations.map((location) => (
                            <div
                                key={location.id}
                                className={`location-card ${location.supportsSelectedTopics ? '' : 'location-card--unsupported'}`.trim()}
                            >
                                <div className="location-main">
                                    <div className="location-icon">
                                        <MapPin size={32} strokeWidth={1.5} />
                                    </div>

                                    <div className="location-details">
                                        <div className="location-header">
                                            <div className="location-address-block">
                                                <h3>{location.branchName || location.address}</h3>
                                                <p className="location-city">
                                                    {[location.address, location.city].filter(Boolean).join(', ')}
                                                </p>
                                                {location.appointments && (
                                                    <p className="location-appointments">{location.appointments}</p>
                                                )}
                                                {!location.supportsSelectedTopics && (
                                                    <p className="location-topic-warning">
                                                        This location does not support: {formatMissingTopics(location.missingTopics)}.
                                                    </p>
                                                )}
                                            </div>
                                            <span className="location-distance">{location.distance}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className={`select-location-btn ${selected === location.id ? 'selected' : ''}`}
                                            onClick={() => handleSelect(location)}
                                            disabled={isRefreshingResults || !location.supportsSelectedTopics}
                                        >
                                            {location.supportsSelectedTopics
                                                ? (selected === location.id ? 'Selected' : 'Select Location')
                                                : 'Unsupported Topics'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!loading && !searching && !loadError && visibleCount < displayLocations.length && (
                            <button
                                type="button"
                                className="search-btn"
                                onClick={() => setVisibleCount((prev) => prev + RESULTS_BATCH_SIZE)}
                                style={{ marginTop: '12px' }}
                            >
                                View more locations
                            </button>
                        )}

                        {!loading && !searching && !loadError && visibleCount > RESULTS_BATCH_SIZE && (
                            <button
                                type="button"
                                className="search-btn"
                                onClick={() => setVisibleCount(RESULTS_BATCH_SIZE)}
                                style={{ marginTop: '12px' }}
                            >
                                Show fewer locations
                            </button>
                        )}
                    </div>
                </div>

                {selected && showContinue && !loading && !isRefreshingResults && displayLocations.length > 0 && (
                    <button
                        type="button"
                        className="continue-btn"
                        onClick={onContinue}
                        style={{ marginTop: '32px' }}
                    >
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
}