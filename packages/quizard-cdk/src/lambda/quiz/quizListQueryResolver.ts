import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLQuery, QueryToQuizListArgs } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import { DBQuiz, DBQuizKeys } from '/opt/models/models';
import { buildQueryCommandInput, getDDBDocClient } from '/opt/utils';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

type TResult = GQLQuery['quizList'];
type TArgs = QueryToQuizListArgs;

export const handler: AppSyncResolverHandler<TArgs, TResult> = async (event) => {
    const env = process.env as LambdaEnv;

    const db = getDDBDocClient();

    const queryCommand = new QueryCommand({
        ...buildQueryCommandInput({
            condition: event.arguments.cond,
            pkName: DBQuizKeys.topic,
            skName: DBQuizKeys.title
        }),
        TableName: env.QUIZ_TABLE_NAME,
        Limit: event.arguments.pagination?.limit,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ExclusiveStartKey: event.arguments.pagination?.exclusiveStartKey
    })
    
    const result = await db.send(queryCommand);

    const dbItems = (result.Items || []) as DBQuiz[];
    return {
        items: dbItems,
        lastEvaluatedKey: result.LastEvaluatedKey
    }
};
