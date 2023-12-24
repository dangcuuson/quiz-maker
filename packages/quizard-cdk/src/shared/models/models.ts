import { GQLQuiz, GQLScore } from '../gqlTypes';

type KeyedObj<T> = {
    [K in keyof T]-?: K;
}

/**
 * Describe how the data looked like in database
 * Also define names of GSI
 */


//#region ---------- QUIZ ----------
export type DBQuiz = GQLQuiz & {
    // this will help query distinct topic without doing a table scan
    // https://aws.amazon.com/blogs/database/generate-a-distinct-set-of-partition-keys-for-an-amazon-dynamodb-table-efficiently/
    dTopic?: string;
}
export const Quiz_distinctTopic_GSI = 'distinct_topic_gsi';
export const Quiz_topic_GSI = 'topic_gsi';

export const DBQuizKeys: KeyedObj<DBQuiz> = {
    dTopic: 'dTopic',
    questions:  'questions',
    quizId: 'quizId',
    title: 'title',
    topic: 'topic'
}
//#endregion

//#region ---------- SCORE ----------
export type DBScore = GQLScore;

export const DBScoreKeys: KeyedObj<DBScore> = {
    createdAt: 'createdAt',
    nCorrect: 'nCorrect',
    nQuestions: 'nQuestions',
    percentage: 'percentage',
    quizId: 'quizId',
    username: 'username',
    userNickname: 'userNickname'
}
// query list of scores of a quiz sorted by time
export const Score_quizId_createdAt_GSI = 'quizId_createdAt_gsi';
// query list of scores of a quiz sorted performance
export const Score_quizId_percentage_GSI = 'quizId_percentage_gsi'
// query list of scores of a user on a certain quiz
export const Score_user_quizId_LSI = 'user_quizId_lsi';

//#endregion