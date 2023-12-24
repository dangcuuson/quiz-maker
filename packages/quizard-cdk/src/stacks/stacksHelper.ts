import fs from 'fs';
import path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration, Stack } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaEnv } from '../shared/types';
import { DBQuizKeys, Quiz_topicIndex } from '../shared/models/models';
import { GQLQuiz, GQLResolver, QueryToQuizItemArgs } from '../shared/gqlTypes';

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

const setupLambda = (args: BuildResolversArgs): { lambdaRole: iam.Role; lambdaLayer: lambda.LayerVersion } => {
    const { rootStack, contextId, quizTable } = args;

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
            ],
        }),
    );

    const lambdaLayer = new lambda.LayerVersion(rootStack, 'lambdaLayer', {
        code: lambda.Code.fromAsset('src/shared'),
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
        description: `Lambda Layer for ${contextId}`,
    });
    quizTable.grantReadWriteData(lambdaRole);

    return { lambdaRole, lambdaLayer };
};

type BuildResolversArgs = {
    rootStack: Stack;
    graphqlApi: appsync.GraphqlApi;
    contextId: string;
    quizTable: ddb.Table;
};

export const buildResolvers = (buildArgs: BuildResolversArgs) => {
    /**
     * Type helpers to register datasource resolver in a declarative way
     */
    type LambdaConfig2 = {
        type: 'lambda';
        fileName: string;
        timeout?: Duration;
    };

    type DDBConfig2 = {
        type: 'ddb';
        requestMappingTemplate?: appsync.MappingTemplate;
        responseMappingTemplate?: appsync.MappingTemplate;
    };

    type ResolverMap<TypeName extends keyof GQLResolver, Type = GQLResolver[TypeName]> = {
        [FieldName in keyof Type]: LambdaConfig2 | DDBConfig2;
    };

    // StrictResolversMap ensures all fields must have a defined resolver
    type StrictResolversMap<TypeName extends keyof GQLResolver> = Required<ResolverMap<TypeName>>;

    /**
     * Here we declare how we want to map graphql resolver datasources
     */
    const QueryTypeResolverMap: StrictResolversMap<'Query'> = {
        // quiz + topic
        quizItem: {
            type: 'ddb',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem(
                DBQuizKeys.quizId,
                asType<keyof QueryToQuizItemArgs>('quizId'),
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        },
        quizList: {
            type: 'ddb',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbQuery(
                appsync.KeyCondition.eq(DBQuizKeys.topic, asType<keyof GQLQuiz>('topic')),
                Quiz_topicIndex,
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
        },
        topicList: { type: 'lambda', fileName: 'topicListResolver.ts' },

        // score
        bestScore: { type: 'lambda', fileName: 'TODO.ts' },
        scoreList: { type: 'lambda', fileName: 'TODO.ts' },
    };
    const MutationTypeResolverMap: StrictResolversMap<'Mutation'> = {
        // quiz + topic
        addQuiz: { type: 'lambda', fileName: 'addQuizResolver.ts' },
        populateQuizData: {
            type: 'lambda',
            fileName: 'populateQuizResolver.ts',
            timeout: Duration.millis(20000),
        },

        // score
        addScore: { type: 'lambda', fileName: 'TODO.ts' },
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
        const { rootStack, graphqlApi, contextId, quizTable } = buildArgs;
        const registerLambdaDatasource = (fieldName: string, config: LambdaConfig2) => {
            // define lambda function
            const { fileName, timeout } = config;
            const functionName = `${contextId}-${typeName}-${fieldName.toString()}`;
            const environment: LambdaEnv = {
                QUIZ_TABLE_NAME: quizTable.tableName,
            };
            const lambdaFunction = new NodejsFunction(rootStack, `${typeName}-${fieldName}-lambda`, {
                functionName,
                entry: `src/lambda/${fileName}`,
                runtime: lambda.Runtime.NODEJS_20_X,
                environment,
                role: lambdaSetup.lambdaRole,
                layers: [lambdaSetup.lambdaLayer],
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

        const registerDDBDatasource = (fieldName: string, config: DDBConfig2) => {
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
