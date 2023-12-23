import { GQLQuiz } from '../gqlTypes';

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

export const DBQuizKeys: KeyedObj<DBQuiz> = {
    dTopic: 'dTopic',
    questions:  'questions',
    quizId: 'quizId',
    title: 'title',
    topic: 'topic'
}