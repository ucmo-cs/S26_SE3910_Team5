// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import TopicSelection from './pages/TopicSelection';
import LocationStep from './pages/LocationStep';
import TimeSelection from './pages/TimeSelection';
import ContactDetails from './pages/ContactDetails';
import Confirmation from './pages/Confirmation';
import './App.css';

export default function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [unlockedSteps, setUnlockedSteps] = useState([1]); // Only Step 1 initially
    const totalSteps = 5;
    const sectionRefs = useRef({});

    const [formData, setFormData] = useState({
        topics: ['checking'], // Default selection for Step 1
        location: null,
        dateTime: null,
        contact: null
    });

    const progressPercent = unlockedSteps.length > 1
        ? ((Math.max(...unlockedSteps) - 1) / (totalSteps - 1)) * 100
        : 0;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const stepNum = parseInt(entry.target.dataset.step);
                        setCurrentStep(stepNum);
                    }
                });
            },
            { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
        );

        unlockedSteps.forEach((stepNum) => {
            const el = sectionRefs.current[stepNum];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [unlockedSteps]);

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

    const getStepClass = (stepNum) => {
        if (stepNum === currentStep) return 'active';
        if (stepNum < currentStep) return 'completed';
        return 'inactive';
    };

    // Update functions - just save data, don't advance
    const updateTopics = (topics) => setFormData(prev => ({ ...prev, topics }));
    const updateLocation = (location) => setFormData(prev => ({ ...prev, location }));
    const updateDateTime = (dateTime) => setFormData(prev => ({ ...prev, dateTime }));
    const updateContact = (contact) => setFormData(prev => ({ ...prev, contact }));

    return (
        <div className="wizard-container" style={{ '--progress-percent': `${progressPercent}%` }}>
            <div className="vertical-track">
                <div className="vertical-track-fill" />
            </div>

            {/* Step 1 */}
            <section ref={(el) => (sectionRefs.current[1] = el)} data-step="1" className="wizard-section">
                <div className={`step-badge ${getStepClass(1)}`}>1</div>
                <div className="section-content">
                    <TopicSelection
                        selectedTopics={formData.topics}
                        onUpdate={updateTopics}
                        onContinue={() => unlockAndScrollTo(2)}
                    />
                </div>
            </section>

            {/* Step 2 */}
            {unlockedSteps.includes(2) && (
                <section ref={(el) => (sectionRefs.current[2] = el)} data-step="2" className="wizard-section">
                    <div className={`step-badge ${getStepClass(2)}`}>2</div>
                    <div className="section-content">
                        <LocationStep
                            selectedLocation={formData.location}
                            onUpdate={updateLocation}
                            onContinue={() => unlockAndScrollTo(3)}
                        />
                    </div>
                </section>
            )}

            {/* Step 3 */}
            {unlockedSteps.includes(3) && (
                <section ref={(el) => (sectionRefs.current[3] = el)} data-step="3" className="wizard-section">
                    <div className={`step-badge ${getStepClass(3)}`}>3</div>
                    <div className="section-content">
                        <TimeSelection
                            selectedDateTime={formData.dateTime}
                            onUpdate={updateDateTime}
                            onContinue={() => unlockAndScrollTo(4)}
                        />
                    </div>
                </section>
            )}

            {/* Step 4 */}
            {unlockedSteps.includes(4) && (
                <section ref={(el) => (sectionRefs.current[4] = el)} data-step="4" className="wizard-section">
                    <div className={`step-badge ${getStepClass(4)}`}>4</div>
                    <div className="section-content">
                        <ContactDetails
                            onUpdate={updateContact}
                            onContinue={() => unlockAndScrollTo(5)}
                        />
                    </div>
                </section>
            )}

            {/* Step 5 */}
            {unlockedSteps.includes(5) && (
                <section ref={(el) => (sectionRefs.current[5] = el)} data-step="5" className="wizard-section">
                    <div className={`step-badge ${getStepClass(5)} checkmark`}>
                        <Check size={28} />
                    </div>
                    <div className="section-content">
                        <Confirmation
                            formData={formData}
                            onEdit={() => unlockAndScrollTo(1)}
                            onCancel={() => {
                                setUnlockedSteps([1]);
                                setCurrentStep(1);
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