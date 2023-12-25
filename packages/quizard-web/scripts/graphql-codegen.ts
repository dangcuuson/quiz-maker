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
                // https://github.com/dotansimha/graphql-code-generator/discussions/8859
                fragmentMasking: false,
            },
        },
    },
    pluckConfig: {
        // this config help working with Apollo GraphQL extension (auto complete)
        modules: [
            {
                name: '@apollo/client',
                identifier: 'gql',
            },
        ],
        gqlMagicComment: ''
    },
};

export default config;
