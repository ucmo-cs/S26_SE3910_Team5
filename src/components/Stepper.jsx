// src/components/Stepper.jsx
export default function Stepper({ currentStep, totalSteps }) {
    return (
        <aside className="sidebar">
            <div className="stepper">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === currentStep;
                    const isPast = stepNum < currentStep;

                    return (
                        <div key={stepNum} className="step-wrapper">
                            <div
                                className={`step-circle ${
                                    isActive ? 'active' : isPast ? 'completed' : 'inactive'
                                }`}
                            >
                                {stepNum}
                            </div>
                            {stepNum < totalSteps && <div className="step-line" />}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}