import { QuizItemFragment, QuizItemQuestionFragment } from '@gql/graphql';
import { useLocalStorage } from '@hooks/hooks';
import { hasBoolField, hasNumField, hasObjField, hasStrField, restoreArr } from '@utils/dataUtils';
import shuffle from 'lodash/shuffle';

// expected data shape of quiz item that was stored in local storaged
export type StoredQuiz = {
    quizCode: string;
    topic: string;
    title: string;
    questions: StoredQuizQuestion[];
    submitted: boolean;
};
export type StoredQuizQuestion = Omit<QuizItemQuestionFragment, '__typename'> & {
    userSelected: number;
};

export const generateQuizQuestions = (quizItem: QuizItemFragment): StoredQuiz => {
    const questions = shuffle(quizItem.questions).slice(0, 10);
    return {
        ...quizItem,
        questions: questions.map((q) => ({
            ...q,
            userSelected: -1,
        })),
        submitted: false,
    };
};

export const STORED_QUIZ_LS_KEY = 'QUIZ_ITEM_STORE';

/**
 * Quiz data will be stored in LocalStorage so that user do not lose their progress
 * This function help retrieving local storage data and make sure the data stored in LS
 * match with expected StoredQuiz
 */
export const getSavedQuizFromLS = (): StoredQuiz | null => {
    const storedStr = localStorage.getItem(STORED_QUIZ_LS_KEY);
    try {
        if (!storedStr) {
            return null;
        }
        const storedJson: unknown = JSON.parse(storedStr);
        if (
            !hasStrField(storedJson, 'quizCode') ||
            !hasStrField(storedJson, 'topic') ||
            !hasStrField(storedJson, 'title') ||
            !hasObjField(storedJson, 'questions') ||
            !hasBoolField(storedJson, 'submitted')
        ) {
            return null;
        }

        const restoredQuestions = restoreArr<StoredQuizQuestion>({
            value: storedJson.questions,
            strict: true,
            itemRestore: (qItem) => {
                if (
                    !hasStrField(qItem, 'questionText') ||
                    !hasObjField(qItem, 'options') ||
                    !hasNumField(qItem, 'userSelected')
                ) {
                    return null;
                }
                type QOption = StoredQuizQuestion['options'][number];
                const restoredOptions = restoreArr<QOption>({
                    value: qItem.options,
                    strict: true,
                    itemRestore: (qOption) => {
                        if (!hasStrField(qOption, 'optionText') || !hasBoolField(qOption, 'isCorrect')) {
                            return null;
                        }
                        return qOption;
                    },
                });
                if (!restoredOptions) {
                    return null;
                }
                return { ...qItem, options: restoredOptions };
            },
        });
        if (!restoredQuestions) {
            return null;
        }
        return { ...storedJson, questions: restoredQuestions };
    } catch {
        return null;
    }
};

export const useSavedQuizState = (initValue: StoredQuiz) => {
    return useLocalStorage({
        getInitValue: () => initValue,
        key: STORED_QUIZ_LS_KEY,
        stringify: v => JSON.stringify(v)
    })
}