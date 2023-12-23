import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    // even though the file is in ./scripts,
    // the base path is where execute this script
    // which is in one level above
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
