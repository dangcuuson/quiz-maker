import { Card, View, Text } from '@aws-amplify/ui-react';
import React from 'react';
import styled from 'styled-components';

const TopicCard = styled(Card)`
    /* border-radius: var(--amplify-radii-medium); */
    flex-grow: 1;
    background-color: var(--amplify-colors-background-info);
    padding: 0;
    :hover {
        cursor: pointer;
        background-color: var(--amplify-colors-background-secondary);
    }
    text-align: center;
`;

const TopicCardContent = styled(View)`
    padding: var(--amplify-space-small);
    :hover {
        cursor: pointer;
        background-color: var(--amplify-colors-background-secondary);
    }
`;

interface Props {
    topic: string;
    onClick: () => void;
}
const TopicItem: React.FC<Props> = ({ topic, onClick }) => {
    return (
        <TopicCard variation="elevated" onClick={onClick}>
            <TopicCardContent>
                <Text variation="primary" fontSize="1.2em">
                    {topic}
                </Text>
            </TopicCardContent>
        </TopicCard>
    );
};

export default TopicItem;
