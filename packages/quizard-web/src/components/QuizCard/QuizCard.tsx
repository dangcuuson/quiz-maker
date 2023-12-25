import { Card, View, Text } from '@aws-amplify/ui-react';
import styled from 'styled-components';

export const QuizCard = styled(Card)`
    flex-grow: 1;
    background-color: ${props => String.apply(props.theme.tokens?.colors?.background?.info)};
    padding: 0;
    :hover {
        cursor: pointer;
        background-color: ${props => String.apply(props.theme.tokens?.colors?.background?.secondary)};
    }
    text-align: center;
`;

export const QuizCardContent = styled(View)`
    padding: ${props => String.apply(props.theme.tokens?.space?.small)};
    display: flex;
    align-items: center;
    justify-content: center;
    :hover {
        cursor: pointer;
    }
`;

// TODO: customize font-size through a size props
export const QuizCardText = styled(Text)`
    font-size: 1.25rem;
`;
