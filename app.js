const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const usersRouter = require('./routes/users.route');
const indexRouter = require('./routes/index');
const workRouter = require('./routes/project.route');
const issues = require('./routes/issues.route');
const sprint = require('./routes/sprint.route');
const comment = require('./routes/comment.route');
const notification = require('./routes/notification.route');
// const handleComment = require('./sockers/handleComment');
const db = require('./configs/db');

// app sever
const app = express();
// socket sever
// const io = require('socket.io')(5000, {
//     cors: {
//         origin: ['http://127.0.0.1:5500', 'https://workflow-ui-lake.vercel.app', 'http://localhost:3000'],
//     },
// });

// const onConnection = (socket) => {
//     handleComment(io, socket);
// };
// io.on('connection', onConnection);
// io.on('error', (err) => {
//     console.log(err);
//     return err;
// });

db();
require('dotenv').config();

app.use(
    cors({
        origin: '*',
    }),
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/issues', issues);
app.use('/sprints', sprint);
app.use('/projects', workRouter);
app.use('/users', usersRouter);
app.use('/comments', comment);
app.use('/notifications', notification);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = { app };
