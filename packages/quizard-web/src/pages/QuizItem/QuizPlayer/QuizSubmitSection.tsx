import { Text, Loader, View, Message, Button, Flex } from '@aws-amplify/ui-react';
import React from 'react';
import { StoredQuiz } from './QuizPlayerHooks';
import { gql } from '@gql/gql';
import { useMutation } from '@apollo/client';
import { maybe } from '@utils/dataUtils';
import { AddScoreMutation } from '@gql/graphql';
import { useEffectOnce } from '@hooks/hooks';
import { useNavigate } from 'react-router';
import { routeConfigs } from '@pages/routeConfig';

const addScoreMutation = gql(/* GraphQL */ `
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

    useEffectOnce(() => {
        const uploadScore = async () => {
            try {
                if (storedQuiz.questions.length === 0) {
                    return;
                }
                if (addScoreState.called) {
                    return;
                }
                const result = await addScore({
                    variables: {
                        input: {
                            quizCode: storedQuiz.quizCode,
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
                View scores
            </Button>
        </Flex>
    );
};

export default QuizSubmitSection;
