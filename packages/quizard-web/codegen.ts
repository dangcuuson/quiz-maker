import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: ['../quizard-cdk/src/schema'],
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        './src/gql/': {
            preset: 'client',
            presetConfig: {
                gqlTagName: 'gql',
            },
        },
    },
};

export default config;
