// workaround for a bug where eslint report error on editor (but not on cli)
// looks like we have to add .eslintrc in every package folder
module.exports = {
    settings: {
        'import/resolver': {
            'typescript': {
                'project': [
                    // './tsconfig.json',
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
        project: [
            // './tsconfig.json', 
        ],
    },
    plugins: ['@typescript-eslint', 'import'],
    ignorePatterns: ['.eslintrc.cjs', 'node_modules', 'cdk.out'],
    root: true
};