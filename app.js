const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mainRouter = require('./routes/router');
const app = express();
const options = {
    etag: true,
    lastModified: false,
    setHeaders: (res, path, stat) => {
        res.set({
            'Cache-Control': 'max-age=00',
        });
    },
};

app.use(express.static(path.join(__dirname, 'public'), options));

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type,request-origin');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
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
