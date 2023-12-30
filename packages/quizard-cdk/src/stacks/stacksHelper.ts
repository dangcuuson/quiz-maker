import fs from 'fs';
import path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaEnv } from '../shared/types';
import { GQLResolver } from '../shared/gqlTypes';

// quickly define a value in a type-safed way
export function asType<T>(value: T): T {
    return value;
}

export const combineGraphqlFilesIntoSchema = () => {
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
        .map((fileName) => {
            return fs.readFileSync(fileName, 'utf-8');
        })
        .join('\n');

    // write combined schema def into one big file and .gitignore it.
    // Make sure to not write them under same folder where we look for smaller .graphql files, otherwise
    // the combined file will be duplicated in subsequence build
    const fileName = 'combined_schema.graphql';
    fs.writeFileSync(path.resolve(fileName), schemaDefs, 'utf-8');
    return appsync.SchemaFile.fromAsset(fileName);
};

const setupLambda = (args: BuildResolversArgs): { lambdaRole: iam.Role; lambdaLayers: lambda.LayerVersion[] } => {
    const { rootStack, contextId, quizTable, scoreTable, userPool } = args;

    const lambdaRole = new iam.Role(rootStack, 'lambdaRole', {
        roleName: `lambda-role-${contextId}`,
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
    });

    lambdaRole.attachInlinePolicy(
        new iam.Policy(rootStack, 'lambdaExecutionAccess', {
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
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    resources: [
                        `arn:aws:cognito-idp:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:userpool/${userPool.userPoolId}`,
                    ],
                    actions: ['cognito-idp:AdminGetUser'],
                }),
            ],
        }),
    );

    const lambdaLayer = new lambda.LayerVersion(rootStack, 'lambdaLayer', {
        code: lambda.Code.fromAsset('src/shared'),
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
        description: `Lambda Layer for ${contextId}`,
    });
    
    quizTable.grantReadWriteData(lambdaRole);
    scoreTable.grantReadWriteData(lambdaRole);

    return { lambdaRole, lambdaLayers: [lambdaLayer] };
};

type BuildResolversArgs = {
    rootStack: cdk.Stack;
    graphqlApi: appsync.GraphqlApi;
    contextId: string;
    quizTable: ddb.Table;
    scoreTable: ddb.Table;
    userPool: cognito.UserPool;
};

export const buildResolvers = (buildArgs: BuildResolversArgs) => {
    /**
     * Type helpers to register datasource resolver in a declarative way
     */
    type LambdaConfig = {
        type: 'lambda';
        fileName: string;
        timeout?: cdk.Duration;
    };

    type DDBConfig = {
        type: 'ddb';
        requestMappingTemplate?: appsync.MappingTemplate;
        responseMappingTemplate?: appsync.MappingTemplate;
    };

    type ResolverMap<TypeName extends keyof GQLResolver, Type = GQLResolver[TypeName]> = {
        [K in keyof Type]: LambdaConfig | DDBConfig
    }
    // StrictResolversMap ensures all fields must have a defined resolver
    type StrictResolversMap<TypeName extends keyof GQLResolver> = Required<ResolverMap<TypeName>>;

    /**
     * Here we declare how we want to map graphql resolver datasources
     */
    const QueryTypeResolverMap: StrictResolversMap<'Query'> = {
        // quiz
        quizList: { type: 'lambda', fileName: 'quiz/quizListQueryResolver' },
        topicList: { type: 'lambda', fileName: 'quiz/topicListQueryResolver' },

        // score
        scoreList: { type: 'lambda', fileName: 'score/scoreListQueryResolver' },
    };
    const MutationTypeResolverMap: StrictResolversMap<'Mutation'> = {
        // quiz
        addQuiz: { type: 'lambda', fileName: 'quiz/addQuizMutationResolver' },
        populateQuizData: {
            type: 'lambda',
            fileName: 'quiz/populateQuizMutationResolver',
            timeout: cdk.Duration.millis(20000),
        },

        // score
        addScore: { type: 'lambda', fileName: 'score/addScoreMutationResolver' },
    };

    /**
     * Imperative function to implement our declaration
     */

    // create lambda role/layer and grant access to quizTable + cloudWatch log
    const lambdaSetup = setupLambda(buildArgs);
    function registerResolverDatasources<TypeName extends keyof GQLResolver>(
        typeName: TypeName,
        resolverMap: ResolverMap<TypeName>,
    ) {
        const { rootStack, graphqlApi, contextId, quizTable, scoreTable, userPool } = buildArgs;
        const registerLambdaDatasource = (fieldName: string, config: LambdaConfig) => {
            // define lambda function
            const { fileName, timeout } = config;
            const functionName = `${contextId}-${typeName}-${fieldName.toString()}`;
            const environment: LambdaEnv = {
                QUIZ_TABLE_NAME: quizTable.tableName,
                SCORE_TABLE_NAME: scoreTable.tableName,
                USER_POOL_ID: userPool.userPoolId,
            };
            const lambdaFunction = new NodejsFunction(rootStack, `${typeName}-${fieldName}-lambda`, {
                functionName,
                // see vite.config.ts for how we got thse file location
                entry: `dist/lambda/${fileName}.js`,
                runtime: lambda.Runtime.NODEJS_20_X,
                environment,
                role: lambdaSetup.lambdaRole,
                layers: lambdaSetup.lambdaLayers,
                timeout,
            });

            // attach lambda to graphql datasource
            graphqlApi
                .addLambdaDataSource(`${typeName}-${fieldName}-ds`, lambdaFunction)
                .createResolver(`${typeName}-${fieldName}-resolver`, {
                    typeName,
                    fieldName,
                });
        };

        const registerDDBDatasource = (fieldName: string, config: DDBConfig) => {
            const { requestMappingTemplate, responseMappingTemplate } = config;
            graphqlApi
                .addDynamoDbDataSource(`${typeName}-${fieldName}-DS`, quizTable)
                .createResolver(`${typeName}-${fieldName}-resolver`, {
                    typeName,
                    fieldName,
                    requestMappingTemplate,
                    responseMappingTemplate,
                });
        };

        for (const fieldName in resolverMap) {
            const config = resolverMap[fieldName];
            switch (config.type) {
                case 'lambda': {
                    registerLambdaDatasource(fieldName, config);
                    break;
                }
                case 'ddb': {
                    registerDDBDatasource(fieldName, config);
                    break;
                }
                default: {
                    throw Error(`Unhandled config type for ${typeName}.${fieldName} resolver`);
                }
            }
        }
    }
    registerResolverDatasources('Query', QueryTypeResolverMap);
    registerResolverDatasources('Mutation', MutationTypeResolverMap);
};
