import { GQLQuiz, GQLScore } from '../gqlTypes';

type KeyedObj<T> = {
    [K in keyof T]-?: K;
}

/**
 * Describe how the data looked like in database
 * Also define names of GSI
 */

export type DBQuiz = GQLQuiz & {
    // this will help query distinct topic without doing a table scan
    // https://aws.amazon.com/blogs/database/generate-a-distinct-set-of-partition-keys-for-an-amazon-dynamodb-table-efficiently/
    dTopic?: string;
}

export const Quiz_distinctTopicIndex = 'distinct_topic';
export const Quiz_topicIndex = 'topic_index';

export const DBQuizKeys: KeyedObj<DBQuiz> = {
    dTopic: 'dTopic',
    questions:  'questions',
    quizId: 'quizId',
    title: 'title',
    topic: 'topic'
}

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