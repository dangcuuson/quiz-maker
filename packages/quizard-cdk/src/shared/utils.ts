import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, BatchWriteCommandInput, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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
