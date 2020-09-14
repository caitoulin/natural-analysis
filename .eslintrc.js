module.exports = {
    env: {
        browser: true,
        node: true,
        commonjs: true,
        es6: true,
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint', // disable eslint与prettier重叠部分 typescript，以prettier为主;eslint-config-prettier
        'prettier/react',
        'plugin:prettier/recommended', //  package eslint-plugin-prettier; 插件字段plugin不可省略:将prettier作为ESLint规范利用，// Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module', // ES代码
        jsx: 'true',
    },
    plugins: ['react', '@typescript-eslint', 'prettier'], // extends找不到就会到plugins中查找
    rules: {
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
