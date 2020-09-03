const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const webpack = require('webpack');

module.exports = merge(base, {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            DEV: JSON.stringify('dev'),
        }),
    ],
});
