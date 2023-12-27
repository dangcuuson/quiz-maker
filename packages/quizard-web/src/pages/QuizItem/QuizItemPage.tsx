import { Alert, Button, Flex, Text, View } from '@aws-amplify/ui-react';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import React from 'react';
import { useParams } from 'react-router';
import QuizPlayer from './QuizPlayer/QuizPlayer';
import { generateQuizQuestions, getSavedQuizFromLS } from './QuizPlayer/QuizPlayerHooks';

const quizItemQuery = gql(`
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

interface Props {}
const QuizItemPage: React.FC<Props> = () => {
    const { topic, title } = useParams();
    const savedQuiz = React.useMemo(() => {
        return getSavedQuizFromLS();
    }, []);
    const [decision, setDecision] = React.useState<'Resume' | 'Get New' | null>(null);
    if (!topic) {
        return <Alert variation="error" hasIcon={true} heading="Missing topic" />;
    }
    if (!title) {
        return <Alert variation="error" hasIcon={true} heading="Missing title" />;
    }

    if (!decision && savedQuiz && !savedQuiz.submitted && savedQuiz.topic === topic && savedQuiz.title === title) {
        return (
            <View>
                <Text fontSize="1.25rem">Found an in progress quiz. Do you want to resume?</Text>
                <Flex gap="small">
                    <Button variation="primary" colorTheme="success" onClick={() => setDecision('Resume')}>
                        Resume quiz
                    </Button>
                    <Button variation="primary" colorTheme="warning" onClick={() => setDecision('Get New')}>
                        Get new quiz
                    </Button>
                </Flex>
            </View>
        );
    }

    if (!!savedQuiz && decision === 'Resume') {
        return <QuizPlayer quizItem={savedQuiz} />;
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
                return <QuizPlayer quizItem={generateQuizQuestions(quizItem)} />;
            }}
        </ApolloQueryWrapper>
    );
};

export default QuizItemPage;
