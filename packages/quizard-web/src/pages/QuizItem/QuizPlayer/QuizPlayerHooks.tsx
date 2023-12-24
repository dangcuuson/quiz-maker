import { QuizItemFragment, QuizItemQuestionFragment } from '@gql/graphql';
import { useLocalStorage } from '@hooks/hooks';
import { hasBoolField, hasNumField, hasObjField, hasStrField, restoreArr } from '@utils/dataUtils';
import _ from 'lodash';

// expected data shape of quiz item that was stored in local storaged
export type StoredQuiz = {
    quizId: string;
    questions: StoredQuizQuestion[];
};
type StoredQuizQuestion = Omit<QuizItemQuestionFragment, '__typename'> & {
    userSelected: number;
};

const pickQuizQuestions = (quizItem: QuizItemFragment): StoredQuiz => {
    const questions = _.shuffle(quizItem.questions).slice(0, 10);
    return {
        quizId: quizItem.quizId,
        questions: questions.map((q) => ({
            ...q,
            userSelected: -1,
        })),
    };
};

/**
 * Look for stored data in local storage and try to restore it into `StoredQuiz`
 * If stored quizId is different than newQuizId => always discard stored data
 * If we cannot restore local storage data => use new data (it will be saved back into local storage later)
 */
export const useStoredQuizReconcilication = (newQuiz: QuizItemFragment) => {
    const [storedQuiz, setStoredQuiz] = useLocalStorage<StoredQuiz>({
        key: `QUIZ_ITEM_STORE`,
        getInitValue: (storedStr) => {
            const tryRestoreSavedQuiz = (): StoredQuiz | null => {
                try {
                    if (!storedStr) {
                        return null;
                    }
                    const storedJson: unknown = JSON.parse(storedStr);
                    if (!hasStrField(storedJson, 'quizId') || !hasObjField(storedJson, 'questions')) {
                        return null;
                    }
                    if (storedJson.quizId !== newQuiz.quizId) {
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

            const savedQuiz = tryRestoreSavedQuiz();
            if (!savedQuiz || savedQuiz.questions.length === 0) {
                return pickQuizQuestions(newQuiz);
            }
            return savedQuiz;
        },
        stringify: (v) => JSON.stringify(v),
    });
    return [storedQuiz, setStoredQuiz] as const;
};
