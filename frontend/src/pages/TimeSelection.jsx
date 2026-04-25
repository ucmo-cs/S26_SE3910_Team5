// src/pages/TimeSelection.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';

const APPOINTMENTS_API_URL = 'http://localhost:8080/appointments';
const SLOT_INCREMENT_MINUTES = 30;
const FULL_DAY_SLOT_COUNT = 20;
const BLOCKING_APPOINTMENT_STATUSES = new Set(['booked', 'completed']);

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
});

function startOfDay(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return startOfDay(next);
}

function addMonth(date) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return startOfDay(next);
}

function isSunday(date) {
    return date.getDay() === 0;
}

function isSameDay(left, right) {
    return (
        left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate()
    );
}

function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateInputValue(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function getBusinessHours(date) {
    const day = date.getDay();
    if (day === 0) return null;
    if (day === 6) {
        return { startHour: 9, startMinute: 0, endHour: 12, endMinute: 0 };
    }
    return { startHour: 8, startMinute: 0, endHour: 17, endMinute: 30 };
}

function buildSlotsForDate(date) {
    const hours = getBusinessHours(date);
    if (!hours) return [];

    const slots = [];
    const cursor = new Date(date);
    cursor.setHours(hours.startHour, hours.startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(hours.endHour, hours.endMinute, 0, 0);

    while (cursor <= end) {
        slots.push(new Date(cursor));
        cursor.setMinutes(cursor.getMinutes() + SLOT_INCREMENT_MINUTES);
    }

    return slots;
}

function toMinuteKey(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function toDisplayDate(date) {
    return dateFormatter.format(date);
}

function toDisplayTime(date) {
    return timeFormatter.format(date);
}

function normalizeWithinBounds(date, minDate, maxDate) {
    let candidate = startOfDay(date);

    if (candidate < minDate) {
        candidate = minDate;
    }
    if (candidate > maxDate) {
        candidate = maxDate;
    }

    if (isSunday(candidate)) {
        const forward = addDays(candidate, 1);
        if (forward <= maxDate) {
            candidate = forward;
        } else {
            candidate = addDays(candidate, -1);
        }
    }

    return startOfDay(candidate);
}

function nextSelectableDate(date, maxDate) {
    let candidate = addDays(date, 1);
    if (isSunday(candidate)) {
        candidate = addDays(candidate, 1);
    }
    return candidate <= maxDate ? candidate : null;
}

function previousSelectableDate(date, minDate) {
    let candidate = addDays(date, -1);
    if (isSunday(candidate)) {
        candidate = addDays(candidate, -1);
    }
    return candidate >= minDate ? candidate : null;
}

function parseSavedSelection(selectedDateTime) {
    if (!selectedDateTime) {
        return null;
    }

    if (selectedDateTime.isoStart) {
        const parsedIso = new Date(selectedDateTime.isoStart);
        if (!Number.isNaN(parsedIso.getTime())) {
            return parsedIso;
        }
    }

    if (selectedDateTime.date && selectedDateTime.time) {
        const parsedText = new Date(`${selectedDateTime.date} ${selectedDateTime.time}`);
        if (!Number.isNaN(parsedText.getTime())) {
            return parsedText;
        }
    }

    return null;
}

export default function TimeSelection({
    selectedDateTime,
    selectedLocation,
    onUpdate,
    onContinue,
    showContinue,
}) {
    const today = useMemo(() => startOfDay(new Date()), []);
    const maxDate = useMemo(() => addMonth(today), [today]);
    const minDate = useMemo(() => normalizeWithinBounds(today, today, maxDate), [today, maxDate]);
    const [selectedDate, setSelectedDate] = useState(minDate);
    const [selectedMinuteKey, setSelectedMinuteKey] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);
    const [now, setNow] = useState(() => new Date());
    const datePickerRef = useRef(null);
    const savedSelectionHydratedRef = useRef(false);

    const selectedBranchId = selectedLocation?.branchId ?? null;

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAvailability() {
            try {
                setLoading(true);
                setError('');

                const appointmentsResponse = await fetch(APPOINTMENTS_API_URL, {
                    method: 'GET',
                    signal: controller.signal,
                });
                if (!appointmentsResponse.ok) {
                    throw new Error(`Unable to load appointments (${appointmentsResponse.status})`);
                }

                const appointmentsPayload = await appointmentsResponse.json();

                setAppointments(Array.isArray(appointmentsPayload) ? appointmentsPayload : []);
            } catch (loadError) {
                if (loadError.name === 'AbortError') {
                    return;
                }
                setAppointments([]);
                setError('Could not load availability right now. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadAvailability();
        return () => controller.abort();
    }, [refreshTick]);

    useEffect(() => {
        if (selectedBranchId) {
            return;
        }
        setSelectedMinuteKey(null);
        onUpdate(null);
    }, [selectedBranchId, onUpdate]);

    const bookedMinuteKeysForDate = useMemo(() => {
        if (!selectedBranchId) {
            return new Set();
        }

        const minuteKeys = new Set();
        const normalizedSelectedBranchId = Number(selectedBranchId);

        appointments.forEach((appointment) => {
            const status = String(appointment?.status || '').trim().toLowerCase();
            if (!BLOCKING_APPOINTMENT_STATUSES.has(status)) {
                return;
            }

            const timeSlot = appointment?.timeSlot;
            const branchId = Number(timeSlot?.branch?.branchId);
            if (Number.isNaN(branchId) || branchId !== normalizedSelectedBranchId) {
                return;
            }

            const startTime = new Date(timeSlot?.startTime);
            if (Number.isNaN(startTime.getTime())) {
                return;
            }

            if (!isSameDay(startTime, selectedDate)) {
                return;
            }

            minuteKeys.add(toMinuteKey(startTime));
        });

        return minuteKeys;
    }, [appointments, selectedBranchId, selectedDate]);

    const slotsForSelectedDate = useMemo(() => {
        return buildSlotsForDate(selectedDate).map((slotDate) => {
            const minuteKey = toMinuteKey(slotDate);
            const isPastSlot = slotDate < now;
            const isDisabled = bookedMinuteKeysForDate.has(minuteKey) || isPastSlot;

            let reason = '';
            if (bookedMinuteKeysForDate.has(minuteKey)) {
                reason = 'Booked';
            } else if (isPastSlot) {
                reason = 'Passed';
            }

            return {
                minuteKey,
                label: toDisplayTime(slotDate),
                isDisabled,
                reason,
                slotDate,
            };
        });
    }, [selectedDate, bookedMinuteKeysForDate, now]);

    useEffect(() => {
        if (savedSelectionHydratedRef.current) {
            return;
        }

        if (!selectedDateTime) {
            savedSelectionHydratedRef.current = true;
            return;
        }

        const parsedSavedDate = parseSavedSelection(selectedDateTime);
        if (!parsedSavedDate) {
            savedSelectionHydratedRef.current = true;
            return;
        }

        const normalizedDate = normalizeWithinBounds(parsedSavedDate, minDate, maxDate);
        setSelectedDate(normalizedDate);
        setSelectedMinuteKey(toMinuteKey(parsedSavedDate));
        savedSelectionHydratedRef.current = true;
    }, [selectedDateTime, minDate, maxDate]);

    useEffect(() => {
        if (selectedMinuteKey === null) {
            return;
        }

        const matchingSlot = slotsForSelectedDate.find(
            (slot) => slot.minuteKey === selectedMinuteKey && !slot.isDisabled,
        );

        if (!matchingSlot) {
            setSelectedMinuteKey(null);
            onUpdate(null);
        }
    }, [selectedMinuteKey, slotsForSelectedDate, onUpdate]);

    const canGoPrevious = previousSelectableDate(selectedDate, minDate) !== null;
    const canGoNext = nextSelectableDate(selectedDate, maxDate) !== null;

    const changeDate = (nextDate) => {
        setSelectedDate(nextDate);
        setSelectedMinuteKey(null);
        onUpdate(null);
    };

    const handlePreviousDay = () => {
        const previous = previousSelectableDate(selectedDate, minDate);
        if (!previous) return;
        changeDate(previous);
    };

    const handleNextDay = () => {
        const next = nextSelectableDate(selectedDate, maxDate);
        if (!next) return;
        changeDate(next);
    };

    const handleDatePickerChange = (event) => {
        const picked = parseDateInputValue(event.target.value);
        if (!picked) return;
        const normalized = normalizeWithinBounds(picked, minDate, maxDate);
        changeDate(normalized);
    };

    const handleOpenDatePicker = () => {
        const input = datePickerRef.current;
        if (!input) return;
        if (typeof input.showPicker === 'function') {
            input.showPicker();
        } else {
            input.click();
        }
    };

    const handleSelectSlot = (slot) => {
        if (!selectedBranchId || slot.isDisabled) {
            return;
        }

        setSelectedMinuteKey(slot.minuteKey);
        onUpdate({
            date: toDisplayDate(selectedDate),
            time: slot.label,
            isoStart: slot.slotDate.toISOString(),
        });
    };

    const handleRetry = () => {
        setRefreshTick((value) => value + 1);
    };

    const handleContinue = () => {
        if (selectedMinuteKey !== null) {
            onContinue();
        }
    };

    return (
        <div style={{ maxWidth: '560px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 400, marginBottom: '20px' }}>
                Let&apos;s find a time that works for you.
            </h1>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                }}
            >
                <button
                    type="button"
                    onClick={handlePreviousDay}
                    disabled={!canGoPrevious}
                    style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: canGoPrevious ? '#ffffff' : '#f3f4f6',
                        color: canGoPrevious ? '#374151' : '#9ca3af',
                        cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    aria-label="Previous day"
                >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>&lt;</span>
                </button>

                <div
                    style={{
                        minWidth: '250px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        color: '#111827',
                        background: '#ffffff',
                    }}
                >
                    {toDisplayDate(selectedDate)}
                </div>

                <button
                    type="button"
                    onClick={handleNextDay}
                    disabled={!canGoNext}
                    style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: canGoNext ? '#ffffff' : '#f3f4f6',
                        color: canGoNext ? '#374151' : '#9ca3af',
                        cursor: canGoNext ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    aria-label="Next day"
                >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>&gt;</span>
                </button>

                <button
                    type="button"
                    onClick={handleOpenDatePicker}
                    style={{
                        border: '1px solid #0891b2',
                        borderRadius: '6px',
                        background: '#0891b2',
                        color: '#ffffff',
                        height: '36px',
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <Calendar size={16} />
                    Calendar
                </button>

                <input
                    ref={datePickerRef}
                    type="date"
                    value={formatDateInputValue(selectedDate)}
                    onChange={handleDatePickerChange}
                    min={formatDateInputValue(minDate)}
                    max={formatDateInputValue(maxDate)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px' }}
                    tabIndex={-1}
                    aria-hidden
                />
            </div>

            {!selectedBranchId && (
                <p style={{ marginBottom: '18px', color: '#6b7280' }}>
                    Select a location in the previous step to view available time slots.
                </p>
            )}

            {loading && <p style={{ color: '#6b7280', marginBottom: '20px' }}>Loading availability...</p>}

            {!loading && error && (
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#b91c1c', marginBottom: '10px' }}>{error}</p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="search-btn"
                        style={{ width: 'auto', padding: '0 14px' }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && selectedBranchId && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '246px' }}>
                        {slotsForSelectedDate.map((slot) => {
                            const selected = selectedMinuteKey === slot.minuteKey;
                            return (
                                <button
                                    key={slot.minuteKey}
                                    type="button"
                                    onClick={() => handleSelectSlot(slot)}
                                    disabled={slot.isDisabled}
                                    style={{
                                        width: '104px',
                                        minHeight: '54px',
                                        borderRadius: '6px',
                                        border: selected ? '1px solid #65a30d' : '1px solid #d1d5db',
                                        background: selected ? '#65a30d' : '#ffffff',
                                        color: selected ? '#ffffff' : (slot.isDisabled ? '#9ca3af' : '#111827'),
                                        cursor: slot.isDisabled ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{slot.label}</span>
                                    {slot.isDisabled && (
                                        <span style={{ fontSize: '10px', lineHeight: 1.1 }}>{slot.reason}</span>
                                    )}
                                </button>
                            );
                        })}
                        {Array.from({ length: Math.max(FULL_DAY_SLOT_COUNT - slotsForSelectedDate.length, 0) }).map((_, index) => (
                            <div
                                key={`slot-placeholder-${index}`}
                                aria-hidden
                                style={{
                                    width: '104px',
                                    minHeight: '54px',
                                    visibility: 'hidden',
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showContinue && (
                <button
                    type="button"
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={selectedMinuteKey === null}
                >
                    Continue
                </button>
            )}
        </div>
    );
}