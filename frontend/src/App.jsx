// src/App.jsx
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import TopicSelection from './pages/TopicSelection';
import LocationStep from './pages/LocationStep';
import TimeSelection from './pages/TimeSelection';
import ContactDetails from './pages/ContactDetails';
import Confirmation from './pages/Confirmation';
//import TestConnection from "./TestingBackFrontConnection";
import './App.css';

/** Mask for green fill: same clear bands as grey rail (notches around each badge), in px relative to fill box */
function buildProgressFillMask(fillTopRelToTrack, fillHeight, notchRangesRelToTrack) {
    if (fillHeight <= 0) return 'none';

    const fillEnd = fillTopRelToTrack + fillHeight;
    let clipped = notchRangesRelToTrack
        .map(({ start, end }) => ({
            start: Math.max(start, fillTopRelToTrack),
            end: Math.min(end, fillEnd),
        }))
        .filter((n) => n.end > n.start)
        .sort((a, b) => a.start - b.start);

    if (clipped.length === 0) {
        return `linear-gradient(to bottom, #fff 0px, #fff ${fillHeight}px)`;
    }

    const merged = [clipped[0]];
    for (let i = 1; i < clipped.length; i++) {
        const prev = merged[merged.length - 1];
        const cur = clipped[i];
        if (cur.start <= prev.end) {
            prev.end = Math.max(prev.end, cur.end);
        } else {
            merged.push({ ...cur });
        }
    }

    const stops = [];
    let cursor = fillTopRelToTrack;
    for (const n of merged) {
        if (n.start > cursor) {
            const a = cursor - fillTopRelToTrack;
            const b = n.start - fillTopRelToTrack;
            stops.push(`#fff ${a}px`, `#fff ${b}px`);
        }
        stops.push(
            `#000 ${n.start - fillTopRelToTrack}px`,
            `#000 ${n.end - fillTopRelToTrack}px`,
        );
        cursor = Math.max(cursor, n.end);
    }
    if (cursor < fillEnd) {
        stops.push(`#fff ${cursor - fillTopRelToTrack}px`, `#fff ${fillHeight}px`);
    }

    return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

export default function App() {
    const [unlockedSteps, setUnlockedSteps] = useState([1]); // Only Step 1 initially
    const sectionRefs = useRef({});
    const wizardRef = useRef(null);
    const trackRef = useRef(null);
    const fillRef = useRef(null);
    const trackTailRef = useRef(null);

    const [formData, setFormData] = useState({
        topics: ['checking'], // Default selection for Step 1
        location: null,
        dateTime: null,
        contact: null
    });

    const measureProgressLayout = useCallback(() => {
        const track = trackRef.current;
        const fill = fillRef.current;
        if (!fill || !unlockedSteps.length) return;

        const progressStep = Math.max(...unlockedSteps);
        const atConfirmation = unlockedSteps.includes(5);

        const section = sectionRefs.current[progressStep];
        if (!track || !section) {
            fill.style.height = '0px';
            fill.style.maskImage = '';
            fill.style.webkitMaskImage = '';
            return;
        }
        const badge = section.querySelector('.step-badge');
        if (!badge) {
            fill.style.height = '0px';
            fill.style.maskImage = '';
            fill.style.webkitMaskImage = '';
            return;
        }
        const trackRect = track.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();
        const badgeGap = 8;

        /*
         * Green ends at the *bottom* of the grey "before" segment — i.e. top of the gap before the
         * furthest unlocked step (same Y as .wizard-rail-line--before). Not driven by scroll.
         */
        const fillEndY = badgeRect.top - badgeGap;

        /* Punch holes through completed step badges (before the progress end step) */
        const notchRangesRelToTrack = [];
        unlockedSteps.forEach((stepNum) => {
            if (stepNum >= progressStep) return;
            const sec = sectionRefs.current[stepNum];
            if (!sec) return;
            const b = sec.querySelector('.step-badge');
            if (!b) return;
            const br = b.getBoundingClientRect();
            const notchTop = br.top - badgeGap - trackRect.top;
            const notchBottom = br.bottom + badgeGap - trackRect.top;
            notchRangesRelToTrack.push({ start: notchTop, end: notchBottom });
        });

        let fillTopRel = 0;
        let fillPx = 0;

        if (progressStep === 1) {
            const fillStartY = badgeRect.top - badgeGap;
            const topOffset = Math.max(0, fillStartY - trackRect.top);
            fillTopRel = topOffset;
            fillPx = Math.max(0, Math.min(fillEndY - fillStartY, trackRect.height - topOffset));
            fill.style.top = `${fillTopRel}px`;
            fill.style.height = `${fillPx}px`;
        } else {
            fill.style.top = '0px';
            fillTopRel = 0;
            fillPx = Math.max(0, Math.min(fillEndY - trackRect.top, trackRect.height));
            fill.style.height = `${fillPx}px`;
        }

        const mask = buildProgressFillMask(fillTopRel, fillPx, notchRangesRelToTrack);
        fill.style.maskImage = mask;
        fill.style.webkitMaskImage = mask;

        const tail = trackTailRef.current;
        if (tail) {
            if (atConfirmation || !track) {
                tail.style.display = 'none';
            } else {
                const r = track.getBoundingClientRect();
                const vh = window.innerHeight;
                if (r.bottom < 0 || r.top > vh) {
                    tail.style.display = 'none';
                } else if (r.bottom < vh - 0.5) {
                    const top = Math.max(r.bottom, 0);
                    tail.style.display = 'block';
                    tail.style.left = `${r.left + r.width / 2 - 1}px`;
                    tail.style.top = `${top}px`;
                    tail.style.height = `${vh - top}px`;
                } else {
                    tail.style.display = 'none';
                }
            }
        }
    }, [unlockedSteps]);

    useLayoutEffect(() => {
        measureProgressLayout();
    }, [measureProgressLayout, unlockedSteps]);

    useEffect(() => {
        const el = wizardRef.current;
        const ro = new ResizeObserver(() => measureProgressLayout());
        if (el) ro.observe(el);
        window.addEventListener('scroll', measureProgressLayout, { passive: true });
        window.addEventListener('resize', measureProgressLayout);
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', measureProgressLayout);
            window.removeEventListener('resize', measureProgressLayout);
        };
    }, [measureProgressLayout, unlockedSteps]);

    const unlockAndScrollTo = (stepNum) => {
        if (!unlockedSteps.includes(stepNum)) {
            setUnlockedSteps(prev => [...prev, stepNum]);
        }

        setTimeout(() => {
            const el = sectionRefs.current[stepNum];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    /** Furthest unlocked step (not scroll position): drives badges, freeze state, and inert on prior steps */
    const currentStep = unlockedSteps.length ? Math.max(...unlockedSteps) : 1;

    const getStepClass = (stepNum) => {
        if (stepNum < currentStep) return 'completed';
        if (stepNum === currentStep) return 'active';
        return 'inactive';
    };

    // Update functions - just save data, don't advance
    const updateTopics = (topics) => setFormData(prev => ({ ...prev, topics }));
    const updateLocation = (location) => setFormData(prev => ({ ...prev, location }));
    const updateDateTime = (dateTime) => setFormData(prev => ({ ...prev, dateTime }));
    const updateContact = (contact) => setFormData(prev => ({ ...prev, contact }));

    const confirmationIsActive = currentStep === 5;

    return (
        <div
            ref={wizardRef}
            className={`wizard-container${confirmationIsActive ? ' wizard-freeze-prior-steps' : ''}`}
        >
            <div ref={trackTailRef} className="vertical-track-tail" aria-hidden="true" />
            <div ref={trackRef} className="wizard-progress-track">
                <div ref={fillRef} className="wizard-progress-fill" />
            </div>

            {/* Step 1 */}
            <section
                ref={(el) => (sectionRefs.current[1] = el)}
                data-step="1"
                className="wizard-section"
                inert={confirmationIsActive}
            >
                <div className="wizard-section-rail" aria-hidden="true">
                    <span className="wizard-rail-line wizard-rail-line--before" />
                    <span className="wizard-rail-line wizard-rail-line--after" />
                </div>
                <div className={`step-badge ${getStepClass(1)}`}>1</div>
                <div className="section-content">
                    <TopicSelection
                        selectedTopics={formData.topics}
                        onUpdate={updateTopics}
                        onContinue={() => unlockAndScrollTo(2)}
                        showContinue={currentStep === 1}
                    />
                </div>
            </section>

            {/* Step 2 */}
            {unlockedSteps.includes(2) && (
                <section
                    ref={(el) => (sectionRefs.current[2] = el)}
                    data-step="2"
                    className="wizard-section"
                    inert={confirmationIsActive}
                >
                    <div className="wizard-section-rail" aria-hidden="true">
                        <span className="wizard-rail-line wizard-rail-line--before" />
                        <span className="wizard-rail-line wizard-rail-line--after" />
                    </div>
                    <div className={`step-badge ${getStepClass(2)}`}>2</div>
                    <div className="section-content">
                        <LocationStep
                            selectedLocation={formData.location}
                            selectedTopics={formData.topics}
                            onUpdate={updateLocation}
                            onContinue={() => unlockAndScrollTo(3)}
                            showContinue={currentStep === 2}
                        />
                    </div>
                </section>
            )}

            {/* Step 3 */}
            {unlockedSteps.includes(3) && (
                <section
                    ref={(el) => (sectionRefs.current[3] = el)}
                    data-step="3"
                    className="wizard-section"
                    inert={confirmationIsActive}
                >
                    <div className="wizard-section-rail" aria-hidden="true">
                        <span className="wizard-rail-line wizard-rail-line--before" />
                        <span className="wizard-rail-line wizard-rail-line--after" />
                    </div>
                    <div className={`step-badge ${getStepClass(3)}`}>3</div>
                    <div className="section-content">
                        <TimeSelection
                            selectedDateTime={formData.dateTime}
                            selectedLocation={formData.location}
                            onUpdate={updateDateTime}
                            onContinue={() => unlockAndScrollTo(4)}
                            showContinue={currentStep === 3}
                        />
                    </div>
                </section>
            )}

            {/* Step 4 */}
            {unlockedSteps.includes(4) && (
                <section
                    ref={(el) => (sectionRefs.current[4] = el)}
                    data-step="4"
                    className="wizard-section"
                    inert={confirmationIsActive}
                >
                    <div className="wizard-section-rail" aria-hidden="true">
                        <span className="wizard-rail-line wizard-rail-line--before" />
                        <span className="wizard-rail-line wizard-rail-line--after" />
                    </div>
                    <div className={`step-badge ${getStepClass(4)}`}>4</div>
                    <div className="section-content">
                        <ContactDetails
                            contactData={formData.contact}
                            onUpdate={updateContact}
                            onContinue={() => unlockAndScrollTo(5)}
                            showContinue={currentStep === 4}
                        />
                    </div>
                </section>
            )}

            {/* Step 5 */}
            {unlockedSteps.includes(5) && (
                <section
                    ref={(el) => (sectionRefs.current[5] = el)}
                    data-step="5"
                    className="wizard-section wizard-section--confirmation"
                >
                    <div className="wizard-section-rail" aria-hidden="true">
                        <span className="wizard-rail-line wizard-rail-line--before" />
                        <span className="wizard-rail-line wizard-rail-line--after" />
                    </div>
                    <div className={`step-badge ${getStepClass(5)} checkmark`}>
                        <Check size={28} />
                    </div>
                    <div className="section-content">
                        <Confirmation
                            formData={formData}
                            onEdit={() => {
                                setUnlockedSteps((prev) => prev.filter((s) => s !== 5));
                                setTimeout(() => {
                                    const el = sectionRefs.current[1];
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }, 100);
                            }}
                            onCancel={() => {
                                setUnlockedSteps([1]);
                                setFormData({
                                    topics: ['checking'],
                                    location: null,
                                    dateTime: null,
                                    contact: null
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}