module.exports = {
    settings: {
        "import/resolver": {
            "typescript": {
                "project": [
                    "packages/*/tsconfig.json",
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
        project: ['./tsconfig.json', "packages/*/tsconfig.json"],
    },
    plugins: ['@typescript-eslint', 'import'],
    ignorePatterns: [".eslintrc.cjs", "node_modules"],
    root: true
};