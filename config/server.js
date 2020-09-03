const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const devConfig = require('./webpack.dev.config');
const compiler = webpack(devConfig);
const hotMiddleWare = require('webpack-hot-middleware')(compiler, {
    log: false,
    heartbeat: 2000,
});
app.use(
    webpackDevMiddleware(compiler, {
        publicPath: devConfig.output.publicPath,
    })
);
app.use(express.static(devConfig.output.path));
app.use(hotMiddleWare);
<<<<<<< HEAD
app.listen(3000, function () {
=======
app.listen(8000, function () {
>>>>>>> 266a437b93b7c4cd6b4a7bff8d5dffcec7821c81
    console.log('Example app listening on port 8000!\n');
});
