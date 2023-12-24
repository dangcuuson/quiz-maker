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
    query quizItem($quizId: ID!) {
        quizItem(quizId: $quizId) {
            ...QuizItem
        }
    }
    fragment QuizItem on Quiz {
        quizId
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
    const { quizId } = useParams();
    if (!quizId) {
        return <Alert variation="error" hasIcon={true} heading="Missing quizId" />;
    }

    return (
        <ApolloQueryWrapper
            query={quizItemQuery}
            variables={{
                quizId,
            }}
        >
            {({ data }) => <QuizItemPageInner quizId={quizId} quizItem={data.quizItem} />}
        </ApolloQueryWrapper>
    );
};

interface InnerProps {
    quizId: string;
    quizItem: QuizItemFragment;
}
const QuizItemPageInner: React.FC<InnerProps> = ({ quizId, quizItem }) => {
    useSetBreadcrumbsOnMount({
        type: 'quiz',
        quizId,
        quizTitle: quizItem.title,
        topic: quizItem.topic,
    });
    return <QuizPlayer quizItem={quizItem} />;
};

export default QuizItemPage;
