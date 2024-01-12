import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import { CDKContext } from '../shared/types';
import { Construct } from 'constructs';
import { combineGraphqlFilesIntoSchema, buildResolvers } from './stacksHelper';
import { DBQuizKeys, Quiz_distinctTopic_GSI, Score_user_percentage_LSI } from '../shared/models/models';
import {
    DBScoreKeys,
    Score_user_quizCode_LSI,
    Score_quizCode_createdAt_GSI,
    Score_quizCode_percentage_GSI,
} from '../shared/models/models';

export class QuizardStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps, context: CDKContext) {
        super(scope, id, props);

        const contextId = `${context.appName}-${context.branchName}`;
        const isProd = context.branchName === 'prod';
        const removalPolicy = isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;

        // DynamoDB
        // quiz
        const quizTableName = `${contextId}-quiz`;
        const quizTable = new ddb.Table(this, 'quizTable', {
            tableName: quizTableName,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: DBQuizKeys.topic, type: ddb.AttributeType.STRING },
            sortKey: { name: DBQuizKeys.title, type: ddb.AttributeType.STRING },
            removalPolicy,
        });
        quizTable.addGlobalSecondaryIndex({
            indexName: Quiz_distinctTopic_GSI,
            partitionKey: { name: DBQuizKeys.dTopic, type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.KEYS_ONLY,
        });

        // score
        const scoreTableName = `${contextId}-score`;
        const scoreTable = new ddb.Table(this, 'scoreTable', {
            tableName: scoreTableName,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: DBScoreKeys.username, type: ddb.AttributeType.STRING },
            sortKey: { name: DBScoreKeys.createdAt, type: ddb.AttributeType.STRING },
            removalPolicy,
        });
        scoreTable.addLocalSecondaryIndex({
            indexName: Score_user_quizCode_LSI,
            sortKey: { name: DBScoreKeys.quizCode, type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.ALL,
        });
        scoreTable.addLocalSecondaryIndex({
            indexName: Score_user_percentage_LSI,
            sortKey: { name: DBScoreKeys.percentage, type: ddb.AttributeType.NUMBER },
            projectionType: ddb.ProjectionType.ALL,
        });
        scoreTable.addGlobalSecondaryIndex({
            indexName: Score_quizCode_createdAt_GSI,
            partitionKey: { name: DBScoreKeys.quizCode, type: ddb.AttributeType.STRING },
            sortKey: { name: DBScoreKeys.createdAt, type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.ALL,
        });
        scoreTable.addGlobalSecondaryIndex({
            indexName: Score_quizCode_percentage_GSI,
            partitionKey: { name: DBScoreKeys.quizCode, type: ddb.AttributeType.STRING },
            sortKey: { name: DBScoreKeys.percentage, type: ddb.AttributeType.NUMBER },
            projectionType: ddb.ProjectionType.ALL,
        });

        // Cognito
        const verifyCodeBody = 'Thank you for signing up to Quizard! Your verification code is {####}';
        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `userPool-${contextId}`,
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
                },
                nickname: {
                    required: true,
                },
            },
            removalPolicy,
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
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool,
                    },
                },
            },
            logConfig: {
                excludeVerboseContent: false,
                fieldLogLevel: appsync.FieldLogLevel.ALL,
                retention: logs.RetentionDays.ONE_WEEK
            }
        });

        // build resolvers
        buildResolvers({
            rootStack: this,
            graphqlApi,
            contextId,
            quizTable,
            scoreTable,
            userPool,
        });

        // output for web client
        type ValidKey = keyof CDKOutputJSON;
        new CfnOutput(this, 'region' satisfies ValidKey, {
            value: this.region,
        });
        new CfnOutput(this, 'userPoolId' satisfies ValidKey, {
            value: userPool.userPoolId,
        });
        new CfnOutput(this, 'userPoolClientId' satisfies ValidKey, {
            value: userPoolClient.userPoolClientId,
        });
        new CfnOutput(this, 'GraphQLAPIURL' satisfies ValidKey, {
            value: graphqlApi.graphqlUrl,
        });
        // do not output graphql api as we only use user pool auth
        // new CfnOutput(this, 'GraphQLAPIKey' satisfies ValidKey, {
        //     value: graphqlApi.apiKey || '',
        // });
        // new CfnOutput(this, 'GraphQLAPIID' satisfies ValidKey, {
        //     value: graphqlApi.apiId,
        // });
    }
}
