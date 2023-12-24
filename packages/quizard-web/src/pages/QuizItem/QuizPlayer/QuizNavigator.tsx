import { Button, Flex, Pagination } from '@aws-amplify/ui-react';
import React from 'react';

interface Props {
    curIndex: number;
    nQuestions: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
    isLastQ: boolean;
    onSubmitConfirmed: () => void;
}
const QuizNavigator: React.FC<Props> = ({ curIndex, nQuestions, setIndex, isLastQ, onSubmitConfirmed }) => {
    return (
        <Flex position="fixed" left="50%" bottom="5%" transform="translateX(-50%)" borderRadius="5" direction="column">
            {!isLastQ && (
                <Button variation="primary" onClick={() => setIndex((p) => p + 1)}>
                    Next question
                </Button>
            )}
            {!!isLastQ && (
                <Button
                    variation="primary"
                    onClick={() => {
                        const ok = confirm(`Submit your answers?`);
                        if (ok) {
                            onSubmitConfirmed();
                        }
                    }}
                >
                    Submit
                </Button>
            )}
            <Pagination
                currentPage={curIndex + 1}
                totalPages={nQuestions}
                onNext={() => setIndex(curIndex + 1)}
                onPrevious={() => setIndex(curIndex - 1)}
                onChange={(newPage) => {
                    if (typeof newPage === 'number') {
                        setIndex(newPage - 1);
                    }
                }}
                siblingCount={2}
            />
        </Flex>
    );
};

export default QuizNavigator;
