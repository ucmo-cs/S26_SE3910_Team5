import {
    Wallet,
    PiggyBank,
    Coins,
    GraduationCap,
    Car,
    Home,
    Building,
    TrendingUp,
    CreditCard,
    MessageSquare,
    Banknote,
} from 'lucide-react';

/** Lucide icon component per topic id (matches TopicSelection / Confirmation labels). */
export const TOPIC_ICON_COMPONENTS = {
    checking: Banknote,
    savings: PiggyBank,
    cds: Coins,
    student: GraduationCap,
    'student-banking': GraduationCap,
    'student-loans': GraduationCap,
    auto: Car,
    home: Home,
    'home-equity': Home,
    mortgage: Building,
    credit: CreditCard,
    'credit-card': CreditCard,
    retirement: Wallet,
    investment: TrendingUp,
    other: MessageSquare,
};

export function getTopicIconComponent(topicId) {
    if (!topicId || topicId === 'default') return Wallet;
    return TOPIC_ICON_COMPONENTS[topicId] || Wallet;
}
