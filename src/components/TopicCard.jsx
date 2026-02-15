// src/components/TopicCard.jsx
import {
    Wallet,
    PiggyBank,
    Coins,
    GraduationCap,
    Car,
    Home,
    Building,
    Landmark,
    TrendingUp,
    CreditCard,
    MessageSquare,
    Banknote
} from 'lucide-react';

const iconMap = {
    'checking': Banknote,
    'savings': PiggyBank,
    'cds': Coins,
    'student-banking': GraduationCap,
    'auto': Car,
    'home-equity': Home,
    'mortgage': Building,
    'student-loans': GraduationCap,
    'retirement': Wallet,
    'investment': TrendingUp,
    'credit-card': CreditCard,
    'other': MessageSquare
};

export default function TopicCard({ id, title, selected, onClick }) {
    const IconComponent = iconMap[id] || Wallet;

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