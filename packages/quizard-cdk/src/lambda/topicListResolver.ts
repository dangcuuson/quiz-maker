import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLQuery } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import { DBQuizKeys, Quiz_distinctTopicIndex } from '/opt/models/models';
import { getDDBDocClient } from '/opt/utils';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

type TResult = GQLQuery['topicList'];

export const handler: AppSyncResolverHandler<unknown, TResult> = async () => {
    const env = process.env as LambdaEnv;

    const db = getDDBDocClient();
    const result = await db.send(
        new ScanCommand({
            TableName: env.QUIZ_TABLE_NAME,
            IndexName: Quiz_distinctTopicIndex,
        }),
    );

    return (result.Items || []).map(i => i[DBQuizKeys.dTopic] + '');
};
