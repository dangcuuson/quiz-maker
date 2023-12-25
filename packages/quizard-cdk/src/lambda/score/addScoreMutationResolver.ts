import { AppSyncResolverHandler } from 'aws-lambda';
import type { GQLMutation, MutationToAddScoreArgs } from '/opt/gqlTypes';
import { getCognitoUser, getDDBDocClient } from '/opt/utils';
import { LambdaEnv } from '/opt/types';
import { DBScore } from '/opt/models/models';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

type TResult = GQLMutation['addScore'];
type TArgs = MutationToAddScoreArgs;

export const handler: AppSyncResolverHandler<TArgs, TResult> = async (event) => {
    const env = process.env as LambdaEnv;
    const { input } = event.arguments;
    const cognitoUser = await getCognitoUser(event.identity, env);
    const nickname = (cognitoUser.UserAttributes || []).find((ua) => ua.Name === 'nickname')?.Value || 'Anonymous';

    const db = getDDBDocClient();
    const dbScore: DBScore = {
        ...input,
        createdAt: new Date().toISOString(),
        percentage: +((input.nCorrect / input.nQuestions) * 100).toFixed(2),
        username: cognitoUser.Username,
        userNickname: nickname,
    };

    await db.send(
        new PutCommand({
            TableName: env.SCORE_TABLE_NAME,
            Item: dbScore,
        }),
    );

    return dbScore;
};
