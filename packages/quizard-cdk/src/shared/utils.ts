import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    BatchWriteCommand,
    BatchWriteCommandInput,
    DynamoDBDocumentClient,
    QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { GQLKeyConditionExpression } from './gqlTypes';
import { omitBy, isNil } from 'lodash';
import { LambdaEnv } from './types';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import _get from 'lodash/get';
import { AppSyncIdentity } from 'aws-lambda';

// Get Document Client
export const getDDBDocClient = (): DynamoDBDocumentClient => {
    const ddbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
    const marshallOptions = {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    };
    const unmarshallOptions = {
        wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);
    return ddbDocClient;
};

export type WriteRequest = NonNullable<BatchWriteCommandInput['RequestItems']>[string][number];
// The BatchWriteItem API only works on 25 items at a time.
export const batchWriteInChunks = async (args: {
    tableName: string;
    writeRequests: WriteRequest[];
    db: DynamoDBDocumentClient;
}) => {
    const { tableName, writeRequests, db } = args;
    const chunks: WriteRequest[][] = [];

    for (let i = 0; i < writeRequests.length; i += 25) {
        chunks.push(writeRequests.slice(i, i + 25));
    }

    const writePromises = chunks.map((chunk) => {
        return new Promise((resolve, reject) => {
            db.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [tableName]: chunk,
                    },
                }),
            )
                .then(resolve)
                .catch(reject);
        });
    });

    await Promise.all(writePromises);
};

/**
 * e.g: type A = { field1?: number, field2?: string, field3?: boolean };
 * this function will make sure that exactly one field in the type is defined
 * By default this function will not count fields where value is null
 * @returns the defined key and value
 */
export function getExactOneDefinedField<T extends object, K extends keyof T>(
    input: T,
    inputName: string,
): {
    key: K;
    value: NonNullable<T[K]>;
} {
    const keys = Object.keys(omitBy(input, isNil)) as K[];
    if (keys.length !== 1) {
        throw Error(`Expect input: ${inputName} to have one field, received: ${keys.length}`);
    }
    const definedField = keys[0];
    const definedValue = input[definedField];
    if (definedValue === null || definedValue === undefined) {
        throw Error(`Input: ${inputName} has defined field ${definedField.toString()} but its value is undefined`);
    }
    return {
        key: definedField,
        value: definedValue,
    };
}

export const buildQueryCommandInput = (args: {
    condition: GQLKeyConditionExpression;
    pkName: string;
    skName: string | null;
}): Pick<QueryCommandInput, 'KeyConditionExpression' | 'ExpressionAttributeNames' | 'ExpressionAttributeValues'> => {
    const { condition, pkName, skName } = args;
    const { pk, sk } = condition;
    let conditionExpr: string = `#pk = :pk`;
    const attributeNames: Record<string, string> = {
        '#pk': pkName,
    };
    const attributeValues: QueryCommandInput['ExpressionAttributeValues'] = {
        ':pk': getExactOneDefinedField(pk, 'pk').value,
    };
    if (sk) {
        if (!skName) {
            throw Error(`Unable to build QueryCommand: missing skName`);
        }
        attributeNames['#sk'] = skName;

        const skExpr = getExactOneDefinedField(sk, 'sk');
        const buildSKCondExpr = (): string => {
            switch (skExpr.key) {
                case 'eq': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.eq').value;
                    return '#sk = :sk';
                }
                case 'lt': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.lt').value;
                    return '#sk < :sk';
                }
                case 'lte': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.lte').value;
                    return '#sk <= :sk';
                }
                case 'gt': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.gt').value;
                    return '#sk > :sk';
                }
                case 'gte': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.gte').value;
                    return '#sk >= :sk';
                }
                case 'beginsWith': {
                    attributeValues[':sk'] = getExactOneDefinedField(skExpr.value, 'sk.beginsWith').value;
                    return 'begins_with(#sk, :sk)';
                }
                case 'between': {
                    const skValue = sk[skExpr.key]!;
                    attributeValues[':sk1'] = getExactOneDefinedField(skValue.from, 'sk.between.from').value;
                    attributeValues[':sk2'] = getExactOneDefinedField(skValue.to, 'sk.between.to').value;
                    return '#sk BETWEEN :sk1 AND :sk2';
                }
            }
        };
        conditionExpr += ` AND ${buildSKCondExpr()}`;
    }

    return {
        KeyConditionExpression: conditionExpr,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
    };
};

export const getCognitoUser = async (identity: AppSyncIdentity, env: LambdaEnv) => {
    const userPoolId = env.USER_POOL_ID;
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
    const username = _get(identity, 'username');

    if (typeof username !== 'string') {
        throw Error(`Invalid username ${username}`);
    }

    const cognitoUser = await cognitoIdentityServiceProvider
        .adminGetUser({
            Username: username,
            UserPoolId: userPoolId,
        })
        .promise();
    return cognitoUser;
};
