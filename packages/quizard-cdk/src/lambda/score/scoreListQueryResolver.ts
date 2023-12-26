import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLQuery, QueryToScoreListArgs } from '/opt/gqlTypes';
import { LambdaEnv } from '/opt/types';
import {
    DBScore,
    DBScoreKeys,
    Score_quizCode_createdAt_GSI,
    Score_quizCode_percentage_GSI,
    Score_user_percentage_LSI,
    Score_user_quizCode_LSI,
} from '/opt/models/models';
import { buildQueryCommandInput, getCognitoUser, getDDBDocClient, getExactOneDefinedField } from '/opt/utils';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

type TResult = GQLQuery['scoreList'];
type TArgs = QueryToScoreListArgs;

export const handler: AppSyncResolverHandler<TArgs, TResult> = async (event) => {
    const env = process.env as LambdaEnv;

    const db = getDDBDocClient();

    if (event.arguments.pagination.limit > 100) {
        throw Error('Exceeded maximum limit of 100');
    }

    // in case of user_* index, query the cognito user and inject them into pk
    const injectCognitoUserToPkValue = async () => {
        const user = await getCognitoUser(event.identity, env);
        event.arguments.cond.pk = {
            string: user.Username
        }
    }

    const getPkSkAndIndex = async (): Promise<{ pkName: string; skName: string | null; IndexName: string | undefined }> => {
        const indexConfig = getExactOneDefinedField(event.arguments.indexConfig, 'indexConfig');
        switch (indexConfig.key) {
            case 'quizCode_createdAt': {
                return {
                    pkName: DBScoreKeys.quizCode,
                    skName: DBScoreKeys.createdAt,
                    IndexName: Score_quizCode_createdAt_GSI,
                };
            }
            case 'quizCode_percentage': {
                return {
                    pkName: DBScoreKeys.quizCode,
                    skName: DBScoreKeys.percentage,
                    IndexName: Score_quizCode_percentage_GSI,
                };
            }
            case 'user_createdAt': {
                await injectCognitoUserToPkValue();
                return { pkName: DBScoreKeys.username, skName: DBScoreKeys.createdAt, IndexName: undefined };
            }
            case 'user_percentage': {
                await injectCognitoUserToPkValue();
                return { pkName: DBScoreKeys.username, skName: DBScoreKeys.percentage, IndexName: Score_user_percentage_LSI };
            }
            case 'user_quizCode': {
                await injectCognitoUserToPkValue();
                return {
                    pkName: DBScoreKeys.username,
                    skName: DBScoreKeys.quizCode,
                    IndexName: Score_user_quizCode_LSI,
                };
            }
        }
    };

    const { pkName, skName, IndexName } = await getPkSkAndIndex();

    const exclusiveStartKey = event.arguments.pagination?.exclusiveStartKey;
    const queryCommand = new QueryCommand({
        ...buildQueryCommandInput({
            condition: event.arguments.cond,
            pkName,
            skName,
        }),
        IndexName,
        TableName: env.SCORE_TABLE_NAME,
        Limit: event.arguments.pagination?.limit,
        ScanIndexForward: !event.arguments.descSort,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ExclusiveStartKey: exclusiveStartKey ? JSON.parse(exclusiveStartKey) : undefined,
    });

    const result = await db.send(queryCommand);

    const dbScores = (result.Items || []) as DBScore[];
    return {
        items: dbScores.map((score) => ({
            ...score,
            // masking useremail
            username: score.username
                .split('@')
                .map((part) => {
                    if (part.length === 2) {
                        return part;
                    }
                    return part.slice(0, 1) + '*'.repeat(part.length - 2) + part.slice(-1);
                })
                .join('@'),
        })),
        lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : undefined,
    };
};
