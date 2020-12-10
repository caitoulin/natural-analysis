const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mainRouter = require('./routes/router');
const app = express();
const bodyParser = require('body-parser');
const options = {
    etag: true,
    lastModified: false,
    setHeaders: (res, path, stat) => {
        res.set({
            'Cache-Control': 'max-age=00',
        });
    },
};
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public'), options));
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000' || '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Accept, X-Requested-With , yourHeaderFeild'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.header('Access-Control-Allow-Credentials', false);
    res.header('X-Powered-By', ' 3.2.1');
    res.header('Content-Type', 'application/json;charset=utf-8');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
app.use('/get', mainRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
