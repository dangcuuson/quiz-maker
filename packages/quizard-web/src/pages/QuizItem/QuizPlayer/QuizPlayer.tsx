
import React from 'react';
import { StoredQuiz, useSavedQuizState } from './QuizPlayerHooks';
import { Flex, Message } from '@aws-amplify/ui-react';
import { maybe } from '@utils/dataUtils';
import QuizNavigator from './QuizNavigator';
import QuizSubmitSection from './QuizSubmitSection';
import QuizQuestionRenderer from './QuizQuestonRenderer';

interface Props {
    quizItem: StoredQuiz;
}
const QuizPlayer: React.FC<Props> = (props) => {
    const [storedQuiz, setStoredQuiz] = useSavedQuizState(props.quizItem);
    const [submitConfirmedByUser, setSubmitComfirmedByUser] = React.useState(false);
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

    const nQuestions = storedQuiz.questions.length;
    const isLastQ = qIndex === nQuestions - 1;

    if (submitConfirmedByUser) {
        return (
            <QuizSubmitSection
                storedQuiz={storedQuiz}
                onCompleted={() => {
                    setStoredQuiz({
                        ...storedQuiz,
                        submitted: true
                    })
                }}
            />
        );
    }

    if (!curQuestion) {
        return <Message colorTheme="error" heading="Question index out of bound" />;
    }
    return (
        // padding to make space for quiz nav, which is fixed bottom
        <Flex direction="column" paddingBottom="120px">
            <QuizQuestionRenderer
                quizQuestion={curQuestion}
                onOptionSelected={(newIndex) => userSelectOption(newIndex)}
            />
            <QuizNavigator
                curIndex={qIndex}
                setIndex={setQIndex}
                nQuestions={nQuestions}
                isLastQ={isLastQ}
                onSubmitConfirmed={() => setSubmitComfirmedByUser(true)}
            />
        </Flex>
    );
};

export default QuizPlayer;
