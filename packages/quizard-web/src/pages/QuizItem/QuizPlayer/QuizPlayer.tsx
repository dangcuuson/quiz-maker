import { QuizItemFragment } from '@gql/graphql';
import React from 'react';
import QuizTextParser from './QuizTextParser';
import _ from 'lodash';
import { useStoredQuizReconcilication } from './QuizPlayerHooks';
import { Alert, Flex, Radio, RadioGroupField } from '@aws-amplify/ui-react';
import { maybe } from '@utils/dataUtils';
import QuizNavigator from './QuizNavigator';
import QuizSubmitBtn from './QuizSubmitBtn';

interface Props {
    quizItem: QuizItemFragment;
}
const QuizPlayer: React.FC<Props> = (props) => {
    const [storedQuiz, setStoredQuiz] = useStoredQuizReconcilication(props.quizItem);
    const [qIndex, setQIndex] = React.useState(() => {
        return storedQuiz.questions.findIndex((q) => q.userSelected < 0);
    });
    const curQuestion = maybe(storedQuiz.questions[qIndex]);
    const userSelectOption = (selectedIndex: number) => {
        setStoredQuiz((prev) => ({
            ...prev,
            questions: prev.questions.map((prevQ, prevQIndex) => ({
                ...prevQ,
                userSelected: prevQIndex === qIndex ? selectedIndex : prevQ.userSelected,
            })),
        }));
    };
    React.useEffect(() => {
        // if for some reason the qIndex is out of bound, attempt to reset back to 0
        if (!curQuestion && storedQuiz.questions.length > 0) {
            setQIndex(0);
        }
    }, [curQuestion, storedQuiz.questions.length, setQIndex]);
    if (!curQuestion) {
        return <Alert variation="error" heading="Question index out of bound" />;
    }
    const nQuestions = storedQuiz.questions.length;
    const isLastQ = qIndex === nQuestions - 1;
    return (
        // padding to make space of quiz nav, which is fixed bottom
        <Flex direction="column" paddingBottom="50px">
            <QuizTextParser text={curQuestion.questionText || ''} />
            <RadioGroupField
                legend=""
                name=""
                onChange={(e) => {
                    const newVal = +e.target.value;
                    userSelectOption(isNaN(newVal) ? -1 : newVal);
                }}
            >
                {curQuestion.options.map((option, index) => {
                    return (
                        <Radio
                            key={index}
                            children={<QuizTextParser text={option.optionText} />}
                            checked={curQuestion.userSelected === index}
                            value={index + ''}
                        />
                    );
                })}
            </RadioGroupField>
            {isLastQ && <QuizSubmitBtn />}
            <QuizNavigator curIndex={qIndex} setIndex={setQIndex} nQuestions={nQuestions} />
        </Flex>
    );
};

export default QuizPlayer;
