import { Alert } from '@aws-amplify/ui-react';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import React from 'react';
import { useParams } from 'react-router';

const quizListQuery = gql(/* GraphQL */ `
    query quizList($topic: String!) {
        quizList(topic: $topic) {
            ...QuizListItem
        }
    }

    fragment QuizListItem on Quiz {
        quizId
        title
    }
`);

const TopicItemPage: React.FC<{}> = () => {
    const { topic } = useParams();
    if (!topic) {
        return <Alert variation="error" hasIcon={true} heading="Missing topic" />;
    }
    return (
        <ApolloQueryWrapper query={quizListQuery} variables={{ topic }}>
            {({ data }) => {
                return <div>{data.quizList.length}</div>;
            }}
        </ApolloQueryWrapper>
    );
};

export default TopicItemPage;
