import { QuizItemFragment } from '@gql/graphql';
import React from 'react';
import QuizTextParser from './QuizTextParser';
import _ from 'lodash';
import { useStoredQuizReconcilication } from './QuizPlayerHooks';
import { Flex, Message, Radio, RadioGroupField } from '@aws-amplify/ui-react';
import { maybe } from '@utils/dataUtils';
import QuizNavigator from './QuizNavigator';
import QuizSubmitSection from './QuizSubmitSection';

interface Props {
    quizItem: QuizItemFragment;
}
const QuizPlayer: React.FC<Props> = (props) => {
    const [storedQuiz, setStoredQuiz] = useStoredQuizReconcilication(props.quizItem);
    const [submitConfirmed, setSubmitComfirmed] = React.useState(false);
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
        return <Message colorTheme="error" heading="Question index out of bound" />;
    }
    const nQuestions = storedQuiz.questions.length;
    const isLastQ = qIndex === nQuestions - 1;

    if (submitConfirmed) {
        return (
            <QuizSubmitSection
                storedQuiz={storedQuiz}
                onCompleted={() =>
                    setStoredQuiz({
                        quizId: '',
                        questions: [],
                    })
                }
            />
        );
    }
    return (
        // padding to make space for quiz nav, which is fixed bottom
        <Flex direction="column" paddingBottom="120px">
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
            <QuizNavigator
                curIndex={qIndex}
                setIndex={setQIndex}
                nQuestions={nQuestions}
                isLastQ={isLastQ}
                onSubmitConfirmed={() => setSubmitComfirmed(true)}
            />
        </Flex>
    );
};

export default QuizPlayer;
