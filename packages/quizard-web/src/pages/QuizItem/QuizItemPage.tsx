import { Alert } from '@aws-amplify/ui-react';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { useSetBreadcrumbsOnMount } from '@components/QuizBreadcrumbs/QuizBreadcrumbs';
import { gql } from '@gql/gql';
import { QuizItemFragment } from '@gql/graphql';
import React from 'react';
import { useParams } from 'react-router';
import _ from 'lodash';
import QuizPlayer from './QuizPlayer/QuizPlayer';

const quizItemQuery = gql(/* GraphQL */ `
    query quizItem($topic: String!, $title: String!) {
        quizList(cond: { pk: { string: $topic }, sk: { eq: { string: $title } } }, pagination: { limit: 1 }) {
            items {
                ...QuizItem
            }
            lastEvaluatedKey
        }
    }
    fragment QuizItem on Quiz {
        quizCode
        topic
        title
        questions {
            ...QuizItemQuestion
        }
    }
    fragment QuizItemQuestion on QuizQuestion {
        questionText
        options {
            ...QuizItemQuestionOption
        }
    }
    fragment QuizItemQuestionOption on QuizQuestionOption {
        optionText
        isCorrect
    }
`);

const QuizItemPage: React.FC<{}> = () => {
    const { topic, title } = useParams();
    if (!topic) {
        return <Alert variation="error" hasIcon={true} heading="Missing topic" />;
    }
    if (!title) {
        return <Alert variation="error" hasIcon={true} heading="Missing title" />;
    }

    return (
        <ApolloQueryWrapper
            query={quizItemQuery}
            variables={{
                topic,
                title,
            }}
        >
            {({ data }) => {
                const quizItem = data.quizList.items[0];
                if (!quizItem) {
                    return <Alert variation="error" hasIcon={true} heading="Unable to find quiz item" />;
                }
                return <QuizItemPageInner quizItem={quizItem} />;
            }}
        </ApolloQueryWrapper>
    );
};

interface InnerProps {
    quizItem: QuizItemFragment;
}
const QuizItemPageInner: React.FC<InnerProps> = ({ quizItem }) => {
    useSetBreadcrumbsOnMount({
        type: 'quiz',
        title: quizItem.title,
        topic: quizItem.topic
    });
    return <QuizPlayer quizItem={quizItem} />;
};

export default QuizItemPage;
