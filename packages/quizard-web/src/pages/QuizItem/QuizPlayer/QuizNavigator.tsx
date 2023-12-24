import { Pagination, View } from '@aws-amplify/ui-react';
import React from 'react';

interface Props {
    curIndex: number;
    nQuestions: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
}
const QuizNavigator: React.FC<Props> = ({ curIndex, nQuestions, setIndex }) => {
    return (
        <View position="fixed" left="50%" bottom="5%" transform="translateX(-50%)" borderRadius="5">
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
            />
        </View>
    );
};

export default QuizNavigator;
