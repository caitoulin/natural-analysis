module.exports = {
    env: {
        browser: true,
        node: true,
        node: true,
        commonjs: true,
        es6: true,
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
        'prettier/react',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        jsx: 'true',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'prettier/prettier': ['error'],
        '@typescript-eslint/ban-types': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'react/display-name': 'off',
        'react/prop-types': 'off',
    },
};
