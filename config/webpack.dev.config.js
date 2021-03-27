const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const webpack = require('webpack');
const path = require('path');
module.exports = merge(base, {
    mode: 'development',
    entry: [
        'webpack-hot-middleware/client',
        path.resolve(__dirname, '../views/src/index.tsx'),
    ],
    devtool: 'source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            DEV: JSON.stringify('dev'),
        }),
    ],
});
