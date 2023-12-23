import fs from 'fs';
import path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration, Stack } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaEnv } from '../shared/types';
import { DBQuiz, Quiz_topicIndex } from '../shared/models/models';
import { GQLQuery, GQLQuiz, GQLResolver } from '../shared/gqlTypes';

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

export const buildLambdaResolvers = (args: {
    rootStack: Stack;
    graphqlApi: appsync.GraphqlApi;
    contextId: string;
    quizTable: ddb.Table;
}) => {
    const { rootStack, graphqlApi, contextId, quizTable } = args;

    // create lambda role and grant access to quizTable + cloudWatch log
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

    type AddLambdaOptions = {
        timeout?: Duration;
    };
    function addLambdaResolver<TypeName extends keyof GQLResolver>(
        typeName: TypeName,
        _fieldName: keyof Required<GQLResolver>[TypeName],
        fileName: string,
        options: AddLambdaOptions = {},
    ) {
        // ts workaround
        const fieldName = _fieldName.toString();
        const functionName = `${contextId}-${typeName}-${fieldName.toString()}`;
        const environment: LambdaEnv = {
            QUIZ_TABLE_NAME: quizTable.tableName,
        };
        const lambdaFunction = new NodejsFunction(rootStack, `${typeName}-${fieldName}-lambda`, {
            functionName,
            entry: `src/lambda/${fileName}`,
            runtime: lambda.Runtime.NODEJS_20_X,
            environment,
            role: lambdaRole,
            layers: [lambdaLayer],
            timeout: options.timeout,
        });

        graphqlApi
            .addLambdaDataSource(`${typeName}-${fieldName}-ds`, lambdaFunction)
            .createResolver(`${typeName}-${fieldName}-resolver`, {
                typeName,
                fieldName,
            });
    }

    addLambdaResolver('Query', 'topicList', 'topicListResolver.ts');
    addLambdaResolver('Mutation', 'addQuiz', 'addQuizResolver.ts');
    addLambdaResolver('Mutation', 'populateQuizData', 'populateQuizResolver.ts', { timeout: Duration.millis(20000) });
};

export const buildDDBResolvers = (args: { graphqlApi: appsync.GraphqlApi; quizTable: ddb.Table }) => {
    const { graphqlApi, quizTable } = args;

    // simple wrap around addDynamoDbDataSource but type-safed
    function addDDBResolver<TypeName extends keyof GQLResolver>(config: {
        typeName: TypeName;
        fieldName: keyof Required<GQLResolver>[TypeName];
        requestMappingTemplate?: appsync.MappingTemplate;
        responseMappingTemplate?: appsync.MappingTemplate;
    }) {
        const { typeName, requestMappingTemplate, responseMappingTemplate } = config;
        // ts workaround
        const fieldName = config.fieldName.toString();
        graphqlApi
            .addDynamoDbDataSource(`${typeName}-${fieldName}-DS`, quizTable)
            .createResolver(`${typeName}-${fieldName}-resolver`, {
                typeName,
                fieldName,
                requestMappingTemplate,
                responseMappingTemplate,
            });
    }

    const query: keyof GQLResolver = 'Query';
    const quizList: keyof GQLQuery = 'quizList';
    const topicGql: keyof GQLQuiz = 'topic';
    const topicDB: keyof DBQuiz = 'topic';
    addDDBResolver({
        typeName: query,
        fieldName: quizList,
        requestMappingTemplate: appsync.MappingTemplate.dynamoDbQuery(
            // 1st topic = dynamo db name, 2st topic = graphql name
            appsync.KeyCondition.eq(topicGql, topicDB),
            Quiz_topicIndex,
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
};
