import { QuizItemFragment, QuizItemQuestionFragment } from '@gql/graphql';
import { useLocalStorage } from '@hooks/hooks';
import shuffle from 'lodash/shuffle';
import { z } from 'zod';

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
        const storedQuizZodSchema = z.object({
            quizCode: z.string(),
            questions: z.array(
                z.object({
                    questionText: z.string(),
                    options: z.array(
                        z.object({
                            optionText: z.string(),
                            isCorrect: z.boolean(),
                        }),
                    ),
                    userSelected: z.number(),
                }),
            ),
            submitted: z.boolean(),
            title: z.string(),
            topic: z.string()
        });
        const storedJson: unknown = JSON.parse(storedStr);
        const parseResult = storedQuizZodSchema.safeParse(storedJson);
        if (parseResult.success) {
            return parseResult.data;
        } else {
            return null;
        }
    } catch {
        return null;
    }
};

export const useSavedQuizState = (initValue: StoredQuiz) => {
    return useLocalStorage({
        getInitValue: () => initValue,
        key: STORED_QUIZ_LS_KEY,
        stringify: (v) => JSON.stringify(v),
    });
};
