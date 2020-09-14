const express = require('express');
const webpack = require('webpack');
const opn = require('opn');
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
app.listen(3000, function () {
    let uri = 'http://localhost:3000';
    console.log('Example app listening on port 3000!\n');
    opn(uri);
});
