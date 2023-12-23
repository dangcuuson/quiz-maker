import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLMutation } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import { DBQuiz } from '/opt/models/models';
import { WriteRequest, batchWriteInChunks, getDDBDocClient } from '/opt/utils';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { HSCQuizzes } from './quizList';

type TResult = GQLMutation['populateQuizData'];

export const handler: AppSyncResolverHandler<unknown, TResult> = async () => {
    const env = process.env as LambdaEnv;
    const db = getDDBDocClient();

    const scanResult = await db.send(
        new ScanCommand({
            TableName: env.QUIZ_TABLE_NAME,
            Limit: 1,
        }),
    );

    // do not populate if there's data already
    if ((scanResult.Count || 0) > 0) {
        return 0;
    }

    let currentTopic = '';
    const writeRequests = HSCQuizzes.map((quiz) => {
        const setDTopic = currentTopic !== quiz.topic;
        currentTopic = quiz.topic;
        const dbQuiz: DBQuiz = {
            ...quiz,
            quizId: `${quiz.topic}#${quiz.title}`,
            dTopic: setDTopic ? quiz.topic : undefined,
        };
        const req: WriteRequest = {
            PutRequest: {
                Item: dbQuiz,
            },
        };
        return req;
    });

    await batchWriteInChunks({
        tableName: env.QUIZ_TABLE_NAME,
        db,
        writeRequests,
    });
    return HSCQuizzes.length;
};
