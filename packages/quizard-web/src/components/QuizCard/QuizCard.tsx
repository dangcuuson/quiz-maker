import { Card, View, Text } from '@aws-amplify/ui-react';
import styled from 'styled-components';

export const QuizCard = styled(Card)`
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

export const QuizCardContent = styled(View)`
    padding: var(--amplify-space-small);
    display: flex;
    align-items: center;
    justify-content: center;
    :hover {
        cursor: pointer;
        background-color: var(--amplify-colors-background-secondary);
    }
`;

// TODO: customize font-size through a size props
export const QuizCardText = styled(Text)`
    font-size: 1.25rem;
`;
