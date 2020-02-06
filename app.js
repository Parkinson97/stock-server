"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("./dataModels/appError");
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let lessMiddleware = require('less-middleware');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.error(new appError_1.AppError("404 not found"));
    next(createError(404));
});
// error handlere
app.use(function (err, req, res, next) {
    // render the error page
    console.error(err.status || 500, appError_1.AppError.from(err));
    // res.render('error');
});
app.listen(process.env.PORT || 3000, function () {
    console.log('SERVER READY');
});
module.exports = app;
//# sourceMappingURL=app.js.map