// src/components/TopicCard.jsx
import { getTopicIconComponent } from '../constants/topicIcons';

export default function TopicCard({ id, title, selected, onClick }) {
    const IconComponent = getTopicIconComponent(id);

    return (
        <button
            className={`topic-card ${selected ? 'selected' : ''}`}
            onClick={() => onClick(id)}
            type="button"
        >
            <div className="card-icon">
                <IconComponent size={32} strokeWidth={1.5} />
            </div>
            <span className="card-title">{title}</span>
        </button>
    );
}