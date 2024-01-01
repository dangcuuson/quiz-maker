import React from 'react';
import { QuizCard, QuizCardContent, QuizCardText } from '@components/Widgets/QuizCard';

interface ItemProps {
    topic: React.ReactNode;
    onClick: () => void;
}
const TopicItemCard: React.FC<ItemProps> = ({ topic, onClick }) => {
    return (
        <QuizCard variation="elevated" onClick={onClick}>
            <QuizCardContent>
                <QuizCardText variation="primary">{topic}</QuizCardText>
            </QuizCardContent>
        </QuizCard>
    );
};

export default TopicItemCard;
