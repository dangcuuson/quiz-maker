import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLMutation } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import { DBQuiz } from '/opt/models/models';
import { getDDBDocClient } from '/opt/utils';
import { BatchWriteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { HSCQuizzes } from './quizList';

type TResult = GQLMutation['populateQuizData'];

export const handler: AppSyncResolverHandler<unknown, TResult> = async () => {
    const env = process.env as LambdaEnv;

    let currentTopic = '';
    const putCommands = HSCQuizzes.map((quiz) => {
        const setDTopic = currentTopic !== quiz.topic;
        currentTopic = quiz.topic;
        const dbQuiz: DBQuiz = {
            ...quiz,
            quizId: `${quiz.topic}#${quiz.title}`,
            dTopic: setDTopic ? quiz.topic : undefined,
        };

        return new PutCommand({
            TableName: env.QUIZ_TABLE_NAME,
            Item: dbQuiz,
        });
    });
    const db = getDDBDocClient();
    await db.send(
        new BatchWriteCommand({
            RequestItems: {
                [env.QUIZ_TABLE_NAME]: putCommands,
            },
        }),
    );

    return HSCQuizzes.length;
};