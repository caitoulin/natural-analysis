const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
console.log('dir', path.resolve(__dirname, '../dist/style.css'));
let htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, '../views/index.html'),
});

let miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: 'style.css',
});
module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        path.resolve(__dirname, '../views/src/index.tsx'),
    ],
    output: {
        path: path.join(__dirname, '..', '/dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.json', '.tsx', '.jsx', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
            },
            {
                test: /\.(jsx|js)$/,
                exclude: /node-modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.(tsx|ts)$/,
                loader: 'ts-loader',
            },
            {
                test: /\.(img|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[ext]',
                },
            },
            {
                test: /\.(woff|woff2|eot|otf|ttf)$/,
                use: 'file-loader',
            },
        ],
    },
    plugins: [
        htmlWebpackPlugin,
        miniCssExtractPlugin,
        new webpack.DllReferencePlugin({
            manifest: require('../dist/vendor-manifest.json'),
        }),
    ],
};
