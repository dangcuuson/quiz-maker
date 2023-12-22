import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CDKContext } from '../shared/types';
import { Construct } from 'constructs';
import fs from 'fs';
import path from 'path';

export class QuizardStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps, context: CDKContext) {
        super(scope, id, props);

        const contextId = `${context.appName}-${context.branchName}`;
        const isProd = context.branchName === 'prod';

        // do not destroy on prod
        const removalPolicy = isProd
            ? RemovalPolicy.RETAIN
            : RemovalPolicy.DESTROY

        // DynamoDB
        const quizTable = new ddb.Table(this, 'quizTable', {
            tableName: `quiz-${contextId}`,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: 'quizId', type: ddb.AttributeType.STRING },
            removalPolicy
        });

        // topic index to query list of topic
        quizTable.addGlobalSecondaryIndex({
            indexName: `topic-index`,
            partitionKey: { name: 'topic', type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.KEYS_ONLY,
        });

        // Cognito
        const verifyCodeBody = 'Thank you for signing up to Quizard! Your verification code is {####}';
        const userPool = new cognito.UserPool(this, 'userPool', {
            userPoolName: `userPool-${contextId}`,
            removalPolicy,
            selfSignUpEnabled: true,
            accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
            userVerification: {
                emailStyle: cognito.VerificationEmailStyle.CODE,
                emailBody: verifyCodeBody,
                smsMessage: verifyCodeBody
            },
            autoVerify: {
                email: true,
                phone: true
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            },
        });


        new cognito.CfnUserPoolGroup(this, 'userPoolGroup', {
            userPoolId: userPool.userPoolId,
            groupName: 'Admin',
            description: `Admin users for ${contextId}`,
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool,
        });

        //#region GRAPHQL

        // recursively look through schema folder and grab files ended with .graphql
        // and merge them together into one file
        function recursiveSearchFile(basePath: string, filterRegex: RegExp, fileNames: string[] = []) {
            const fileStat = fs.statSync(basePath);
            if (fileStat.isDirectory()) {
                const directory = fs.readdirSync(basePath);
                directory.forEach((f) => recursiveSearchFile(path.join(basePath, f), filterRegex, fileNames));
            } else if (filterRegex.test(basePath)) {
                fileNames.push(basePath);
            }
            return fileNames;
        }
        const graphqlFiles = recursiveSearchFile(path.resolve('src/schema'), /\.graphql$/);
        const schemaDefs = graphqlFiles
            .map(fileName => {
                return appsync.SchemaFile.fromAsset(fileName).definition
            })
            .join('\n');
        
        // write combined schema def into one big file and .gitignore it.
        // Make sure to not write them under same folder where we look for smaller .graphql files, otherwise
        // the combined file will be duplicated in subsequence build
        fs.writeFileSync(path.resolve('combined_schema.graphql'), schemaDefs, 'utf-8');
        const graphqlApi = new appsync.GraphqlApi(this, 'graphqlApi', {
            name: contextId,
            definition: {
                schema: appsync.SchemaFile.fromAsset('combined_schema.graphql')
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool
                    }
                },
                additionalAuthorizationModes: [{
                    authorizationType: appsync.AuthorizationType.API_KEY,
                }]
            },
        });

        // map graphql resources to DDB tables
        // TODO: generate types from schema for type-safety

        // mutation.quizItem
        graphqlApi
            .addDynamoDbDataSource('quizItemQueryDS', quizTable)
            .createResolver('quizItemQueryResolver', {
                typeName: 'Query',
                fieldName: 'quizItem',
                requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('quizId', 'id'),
                responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
            });

        // mutation.addQuiz
        graphqlApi
            .addDynamoDbDataSource('addQuizMutationDS', quizTable)
            .createResolver('addQuizMutationResolve', {
                typeName: 'Mutation',
                fieldName: 'addQuiz',
                requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
                    appsync.PrimaryKey.partition('quizId').auto(),
                    appsync.Values.projecting('input').attribute('test').is('yes')
                ),
                responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
            });

        //#endregion


        // output for web client
        function asType<T>(value: T): string { return value + ''; }
        type ValidKey = keyof CDKOutputJSON;
        new CfnOutput(this, asType<ValidKey>('userPoolId'), {
            value: userPool.userPoolId,
        })
        new CfnOutput(this, asType<ValidKey>('userPoolClientId'), {
            value: userPoolClient.userPoolClientId,
        })
        new CfnOutput(this, 'GraphQLAPIURL', {
            value: graphqlApi.graphqlUrl,
        })
        new CfnOutput(this, 'GraphQLAPIKey', {
            value: graphqlApi.apiKey || '',
        })
        new CfnOutput(this, 'GraphQLAPIID', {
            value: graphqlApi.apiId,
        })
    }
}
