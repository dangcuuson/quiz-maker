// workaround for a bug where if quizard-cdk was added as workspace, it doesn't recognize
// the ts.config in the folder where we added logic for lambda path mapping
module.exports = {
    settings: {
        'import/resolver': {
            'typescript': {
                'project': [
                    './tsconfig.json',
                    'packages/*/tsconfig.json',
                ]
            }
        }
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', 'packages/*/tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'import'],
    ignorePatterns: ['.eslintrc.cjs', 'node_modules', 'cdk.out'],
    root: true
};