import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLQuery } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import { DBQuizKeys, Quiz_distinctTopic_GSI } from '/opt/models/models';
import { getDDBDocClient } from '/opt/utils';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';

type TResult = GQLQuery['topicList'];

export const handler: AppSyncResolverHandler<unknown, TResult> = async () => {
    const env = process.env as LambdaEnv;

    const db = getDDBDocClient();
    const result = await db.send(
        new ScanCommand({
            TableName: env.QUIZ_TABLE_NAME,
            IndexName: Quiz_distinctTopic_GSI,
        }),
    );

    return _.uniq((result.Items || []).map(i => i[DBQuizKeys.dTopic] + '').sort());
};
