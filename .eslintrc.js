module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Style rules
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        
        // Best practices
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off',
        'prefer-const': 'error',
        'no-var': 'error',
        
        // Async/await
        'require-await': 'error',
        'no-return-await': 'error',
        
        // Modern JS
        'prefer-arrow-callback': 'error',
        'prefer-template': 'error',
        'object-shorthand': 'error',
        
        // Imports
        'no-duplicate-imports': 'error'
    },
    globals: {
        // Global variables used in the app
        'algoliasearch': 'readonly'
    }
};