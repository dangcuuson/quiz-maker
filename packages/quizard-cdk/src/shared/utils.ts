import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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
