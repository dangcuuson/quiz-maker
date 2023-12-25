import { Alert } from '@aws-amplify/ui-react';
import React from 'react';
import { useParams } from 'react-router';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';

const scoresOfQuizQuery = gql(`
    query x($v: String!) {
        quizList(cond: { pk: { string: $v } }) {
            items {
                topic
            }
        }
    }
`);

interface Props {}
const ScoresPage: React.FC<Props> = () => {
    const { quizCode } = useParams();
    if (!quizCode) {
        return <Alert variation="error" hasIcon={true} heading="Missing quiz code" />;
    }
    return <ApolloQueryWrapper query={scoresOfQuizQuery} variables={{  }}></ApolloQueryWrapper>;
};

export default ScoresPage;
