import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLMutation, MutationToAddQuizArgs } from '/opt/gqlTypes';
import { getDDBDocClient } from '/opt/utils';
import { LambdaEnv } from '/opt/types';
import { DBQuiz, DBQuizKeys, Quiz_distinctTopic_GSI } from '/opt/models/models';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

type TResult = GQLMutation['addQuiz'];
type TArgs = MutationToAddQuizArgs;

export const handler: AppSyncResolverHandler<TArgs, TResult> = async (event) => {
    const env = process.env as LambdaEnv;
    const { input } = event.arguments;

    const db = getDDBDocClient();

    const dbQuiz: DBQuiz = {
        quizId: `${input.topic}#${input.title}`,
        ...event.arguments.input,
    };

    const checkIsNewTopic = async () => {
        const result = await db.send(
            new QueryCommand({
                TableName: env.QUIZ_TABLE_NAME,
                IndexName: Quiz_distinctTopic_GSI,
                KeyConditionExpression: `${DBQuizKeys.dTopic} = :topic`,
                ExpressionAttributeValues: {
                    ':topic': input.topic,
                },
                Limit: 1,
            }),
        );
        return (result.Count || 0) === 0;
    };
    const isNewTopic = await checkIsNewTopic();
    if (isNewTopic) {
        dbQuiz.dTopic = input.topic;
    }

    await db.send(
        new PutCommand({
            TableName: env.QUIZ_TABLE_NAME,
            Item: dbQuiz,
        }),
    );

    return dbQuiz;
};
