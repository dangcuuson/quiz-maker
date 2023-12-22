import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CDKContext } from '../shared/types';
import { Construct } from 'constructs';

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

        // Cognito
        const userPool = new cognito.UserPool(this, 'userPool', {
            userPoolName: `userPool-${contextId}`,
            removalPolicy,
            selfSignUpEnabled: true,
            accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
            userVerification: {
                emailStyle: cognito.VerificationEmailStyle.CODE,
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


        new cognito.CfnUserPoolGroup(this, 'userPoolGroup', {
            userPoolId: userPool.userPoolId,
            groupName: 'Admin',
            description: `Admin users for ${contextId}`,
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool,
        });

        // graphql
        const graphqlApi = new appsync.GraphqlApi(this, 'graphqlApi', {
            name: contextId,
            // schema: appsync.Schema.fromAsset('lib/schema.graphql'),
            definition: {
                schema: appsync.SchemaFile.fromAsset('lib/schema.graphql')
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                },
                // additionalAuthorizationModes: [{
                //   authorizationType: appsync.AuthorizationType.USER_POOL
                // }]
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
                    appsync.Values.projecting('input')
                ),
                responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
            });


        // output for web client
        new CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
        })
        new CfnOutput(this, 'UserPoolClientId', {
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
