import React from 'react';
import { gql } from '../../gql';
import { createApolloQuery } from '../ApolloWrapper/ApolloQueryWrapper';

const addQuizMutation = gql(/* GraphQL */ `
    mutation addQuiz($input: QuizInput!) {
        quizId
    }
`);
const AddQuizMutation = createApolloQuery(addQuizMutation);

interface Props {}
const PopulateData: React.FC<Props> = () => {
    return (
        <TopicListQuery>
            {({ data }) => {
                return <div>{data.topicList.length}</div>
            }}
        </TopicListQuery>
    )
};

export default PopulateData;
