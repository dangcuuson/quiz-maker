import React from 'react';
import QuizTextParser from './QuizTextParser';
import { Radio, RadioGroupField } from '@aws-amplify/ui-react';
import { StoredQuizQuestion } from './QuizPlayerHooks';

interface Props {
    quizQuestion: StoredQuizQuestion;
    // if undefined => render for view only so the radio group will be disabled
    onOptionSelected?: (index: number) => void;
}
const QuizQuestionRenderer: React.FC<Props> = ({ quizQuestion, onOptionSelected }) => {
    return (
        <React.Fragment>
            <QuizTextParser text={quizQuestion.questionText || ''} />
            <RadioGroupField
                legend=""
                name=""
                disabled={!onOptionSelected}
                onChange={(e) => {
                    const newVal = +e.target.value;
                    onOptionSelected?.(isNaN(newVal) ? -1 : newVal);
                }}
            >
                {quizQuestion.options.map((option, index) => {
                    return (
                        <Radio
                            key={index}
                            children={<QuizTextParser text={option.optionText} />}
                            checked={quizQuestion.userSelected === index}
                            value={index + ''}
                        />
                    );
                })}
            </RadioGroupField>
        </React.Fragment>
    );
};

export default QuizQuestionRenderer;
