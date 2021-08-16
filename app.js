var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var path = require('path');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

require('./src/canvasConnection.js')
require('./src/canvasUtils.js')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/api', indexRouter);
app.use('/users', usersRouter);
app.use('/images', express.static(path.resolve(__dirname, "static/")));

//TODO: For prod we should serve the React static files generated with npm run build here
// app.use(express.static(path.resolve(__dirname, "../canvas/client/build/")));
app.use(express.static(path.resolve(__dirname, "../canvas-server/build/")));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../canvas-server/build/', 'index.html'));
});
app.get('/canvas', (req, res) => {
  res.sendFile(path.join(__dirname, '../canvas-server/build/', 'index.html'));
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
