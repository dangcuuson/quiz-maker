import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CDKContext } from '../shared/types';
import { Construct } from 'constructs';
import { combineGraphqlFilesIntoSchema, buildLambdaResolvers, buildDDBResolvers } from './stacksHelper';
import { DBQuizKeys, Quiz_distinctTopicIndex } from '../shared/models/models';

export class QuizardStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps, context: CDKContext) {
        super(scope, id, props);

        const contextId = `${context.appName}-${context.branchName}`;
        const isProd = context.branchName === 'prod';

        // do not destroy on prod
        const removalPolicy = isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;

        // DynamoDB
        const quizTableName = `quiz-${contextId}`;
        const quizTable = new ddb.Table(this, 'quizTable', {
            tableName: quizTableName,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: DBQuizKeys.quizId, type: ddb.AttributeType.STRING },
            removalPolicy,
        });
        quizTable.addGlobalSecondaryIndex({
            indexName: Quiz_distinctTopicIndex,
            partitionKey: { name: DBQuizKeys.dTopic, type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.KEYS_ONLY,
        });

        // Cognito
        const verifyCodeBody = 'Thank you for signing up to Quizard! Your verification code is {####}';
        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `userPool-${contextId}`,
            removalPolicy,
            selfSignUpEnabled: true,
            accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
            userVerification: {
                emailStyle: cognito.VerificationEmailStyle.CODE,
                emailBody: verifyCodeBody,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            },
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool,
        });

        // graphql
        const graphqlApi = new appsync.GraphqlApi(this, 'graphqlApi', {
            name: contextId,
            definition: {
                schema: combineGraphqlFilesIntoSchema(),
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                },
                additionalAuthorizationModes: [
                    {
                        authorizationType: appsync.AuthorizationType.USER_POOL,
                        userPoolConfig: {
                            userPool,
                        },
                    },
                ],
            },
        });
        // build resolvers from lambda & DDB DataSource
        buildLambdaResolvers({
            rootStack: this,
            graphqlApi,
            contextId,
            quizTable,
        });
        buildDDBResolvers({ graphqlApi, quizTable });

        // output for web client
        function asType<T>(value: T): T {
            return value;
        }
        type ValidKey = keyof CDKOutputJSON;
        new CfnOutput(this, asType<ValidKey>('userPoolId'), {
            value: userPool.userPoolId,
        });
        new CfnOutput(this, asType<ValidKey>('userPoolClientId'), {
            value: userPoolClient.userPoolClientId,
        });
        new CfnOutput(this, asType<ValidKey>('GraphQLAPIURL'), {
            value: graphqlApi.graphqlUrl,
        });
        new CfnOutput(this, asType<ValidKey>('GraphQLAPIKey'), {
            value: graphqlApi.apiKey || '',
        });
        new CfnOutput(this, asType<ValidKey>('GraphQLAPIID'), {
            value: graphqlApi.apiId,
        });
    }
}
