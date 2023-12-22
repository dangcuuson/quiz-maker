module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: [".eslintrc.cjs", "node_modules", "quizard-amplify"],
    root: true,
    rules: {
        "semi-style": ["error", "last"],
        "prefer-const": "error"
    }
};