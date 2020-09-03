const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const webpack = require('webpack');
const OptimizeCss = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(base, {
    mode: 'production',
    optimization: {
        minimizer: [
            new OptimizeCss(),
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
            }),
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            DEV: JSON.stringify('production'),
        }),
    ],
});
