import {
    Text,
    Loader,
    View,
    Message,
    Button,
    Flex,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@aws-amplify/ui-react';
import React from 'react';
import { StoredQuiz } from './QuizPlayerHooks';
import { gql } from '@gql/gql';
import { useMutation } from '@apollo/client';
import { maybe } from '@utils/dataUtils';
import { AddScoreMutation } from '@gql/graphql';
import { useEffectOnce } from '@hooks/hooks';
import { useNavigate } from 'react-router';
import { routeConfigs } from '@config/routeConfigs';
import QuizQuestionRenderer from './QuizQuestonRenderer';

const addScoreMutation = gql(`
    mutation addScore($input: ScoreInput!) {
        addScore(input: $input) {
            percentage
            nCorrect
            nQuestions
        }
    }
`);

interface Props {
    storedQuiz: StoredQuiz;
    onCompleted: () => void;
}
const QuizSubmitSection: React.FC<Props> = ({ storedQuiz, onCompleted }) => {
    const navigate = useNavigate();
    const [error, setError] = React.useState('');
    const [addScoreResult, setAddScoreResult] = React.useState<AddScoreMutation | null>(null);
    const [addScore, addScoreState] = useMutation(addScoreMutation);
    const [reviewQuestionIndex, setReviewQuestionIndex] = React.useState(-1);
    const qToReview = maybe(storedQuiz.questions[reviewQuestionIndex]);

    useEffectOnce(() => {
        const uploadScore = async () => {
            try {
                if (storedQuiz.submitted || storedQuiz.questions.length === 0) {
                    return;
                }
                if (addScoreState.called) {
                    return;
                }
                const result = await addScore({
                    variables: {
                        input: {
                            quizCode: storedQuiz.quizCode,
                            title: storedQuiz.title,
                            topic: storedQuiz.topic,
                            nQuestions: storedQuiz.questions.length,
                            nCorrect: storedQuiz.questions.filter((q) => {
                                const selectedOption = maybe(q.options[q.userSelected]);
                                return selectedOption?.isCorrect;
                            }).length,
                        },
                    },
                });
                setAddScoreResult(result.data || null);
                onCompleted();
            } catch (err) {
                console.error(err);
                setError(`An error occured when trying to submit your answers :(`);
            }
        };
        void uploadScore();
    });
    if (addScoreState.loading || !addScoreState.called) {
        return (
            <View>
                <Text>Submitting your answers. Please wait</Text>
                <Loader variation="linear" />
            </View>
        );
    }
    if (error) {
        return <Message colorTheme="error" hasIcon={true} heading={error} />;
    }
    return (
        <Flex direction="column">
            <Message colorTheme="success" hasIcon={true} heading={<Text>Your score has been uploaded</Text>} />
            {!!addScoreResult && (
                <Text>
                    Your score is {addScoreResult.addScore.nCorrect}/{addScoreResult.addScore.nQuestions}
                </Text>
            )}
            <Button
                variation="primary"
                onClick={() =>
                    navigate({
                        pathname: routeConfigs.scores.getPath(storedQuiz.quizCode),
                    })
                }
            >
                View scores leaderboard
            </Button>
            {!qToReview && (
                <Table caption="" highlightOnHover={false}>
                    <TableHead backgroundColor="background.quaternary">
                        <TableRow>
                            <TableCell as="th">Question #</TableCell>
                            <TableCell as="th">Your answer</TableCell>
                            <TableCell as="th">Correct answer</TableCell>
                            <TableCell as="th"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody backgroundColor="background.secondary">
                        {storedQuiz.questions.map((question, index) => {
                            const correctIndex = question.options.findIndex((o) => o.isCorrect);
                            const printLabelFromIndex = (idx: number): string => {
                                return ['A', 'B', 'C', 'D'][idx] || 'N/A';
                            };
                            const isCorrect = correctIndex === question.userSelected;
                            return (
                                <TableRow
                                    key={index}
                                    backgroundColor={isCorrect ? 'background.success' : 'background.error'}
                                >
                                    <TableCell as="th">{index + 1}</TableCell>
                                    <TableCell as="th">{printLabelFromIndex(question.userSelected)}</TableCell>
                                    <TableCell as="th">{printLabelFromIndex(correctIndex)}</TableCell>
                                    <TableCell as="th">
                                        <Button onClick={() => setReviewQuestionIndex(index)}>Review question</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
            {!!qToReview && (
                <React.Fragment>
                    <Flex alignItems="center" gap="small">
                        <Text fontSize="1.2em">Reviewing question #{reviewQuestionIndex + 1}</Text>
                        <Button gap="small" onClick={() => setReviewQuestionIndex(-1)}>
                            View scores table
                        </Button>
                    </Flex>
                    <QuizQuestionRenderer quizQuestion={qToReview} />
                </React.Fragment>
            )}
        </Flex>
    );
};

export default QuizSubmitSection;
