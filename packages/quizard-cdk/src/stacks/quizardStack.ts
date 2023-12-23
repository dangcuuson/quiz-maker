import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { CDKContext } from '../shared/types';
import { Construct } from 'constructs';
import { combineGraphqlFilesIntoSchema } from './stacksHelper';

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
            partitionKey: { name: 'quizId', type: ddb.AttributeType.STRING },
            sortKey: { name: 'topic', type: ddb.AttributeType.STRING },
            removalPolicy,
        });
        const topicGSIName = 'topic-index';
        quizTable.addGlobalSecondaryIndex({
            indexName: topicGSIName,
            partitionKey: { name: 'topic', type: ddb.AttributeType.STRING },
            projectionType: ddb.ProjectionType.ALL,
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

        //#region Lambda
        // create lambda role and grant access to quizTable + generate log
        const lambdaRole = new iam.Role(this, 'lambdaRole', {
            roleName: `lambda-role-${contextId}`,
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
        });

        lambdaRole.attachInlinePolicy(
            new iam.Policy(this, 'lambdaExecutionAccess', {
                policyName: 'lambdaExecutionAccess',
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        resources: ['*'],
                        actions: [
                            'logs:CreateLogGroup',
                            'logs:CreateLogStream',
                            'logs:DescribeLogGroups',
                            'logs:DescribeLogStreams',
                            'logs:PutLogEvents',
                        ],
                    }),
                ],
            }),
        );

        const lambdaLayer = new lambda.LayerVersion(this, 'lambdaLayer', {
            code: lambda.Code.fromAsset('src/shared'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: `Lambda Layer for ${context.appName}`,
        });
        quizTable.grantReadWriteData(lambdaRole);

        //#endregion

        //#region GRAPHQL
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
                        }
                    },
                ],
            },
        });

        // map graphql resources to DDB tables
        // TODO: generate types from schema for type-safety
        const lambdaFunction = new NodejsFunction(this, 'testLambdaFn', {
            functionName: `testLambadaFn-${contextId}`,
            entry: 'src/lambda/testLambda.ts',
            runtime: lambda.Runtime.NODEJS_20_X,
            environment: {
                quizTableName,
            },
            role: lambdaRole,
            layers: [lambdaLayer],
        });
        graphqlApi.addLambdaDataSource('testLambdaDS', lambdaFunction).createResolver('Query.testLambda', {
            typeName: 'Query',
            fieldName: 'testLambda',
        });

        // query.quizList
        graphqlApi.addDynamoDbDataSource('quizListQueryDS', quizTable).createResolver('quizListQueryResolver', {
            typeName: 'Query',
            fieldName: 'quizList',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbQuery(
                // 1st topic = dynamo db name, 2st topic = graphql name
                appsync.KeyCondition.eq('topic', 'topic'),
                topicGSIName,
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
        });

        // mutation.addQuiz
        graphqlApi.addDynamoDbDataSource('addQuizMutationDS', quizTable).createResolver('addQuizMutationResolve', {
            typeName: 'Mutation',
            fieldName: 'addQuiz',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
                appsync.PrimaryKey.partition('quizId').auto(),
                appsync.Values.projecting('input'),
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        });
        //#endregion

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
