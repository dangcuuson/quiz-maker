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

export const DBQuizKeys: KeyedObj<DBQuiz> = {
    topic: 'topic',
    title: 'title',
    dTopic: 'dTopic',
    questions:  'questions',
    quizCode: 'quizCode',
}
//#endregion

//#region ---------- SCORE ----------
export type DBScore = GQLScore;

export const DBScoreKeys: KeyedObj<DBScore> = {
    createdAt: 'createdAt',
    nCorrect: 'nCorrect',
    nQuestions: 'nQuestions',
    percentage: 'percentage',
    quizCode: 'quizCode',
    username: 'username',
    userNickname: 'userNickname',
    title: 'title',
    topic: 'topic'
}
export const Score_quizCode_createdAt_GSI = 'quizCode_createdAt_gsi';
export const Score_quizCode_percentage_GSI = 'quizCode_percentage_gsi'
export const Score_user_quizCode_LSI = 'user_quizCode_lsi';
export const Score_user_percentage_LSI = 'user_percentage_lsi';

//#endregion