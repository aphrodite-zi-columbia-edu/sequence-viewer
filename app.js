var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');

var app = express();
var exphbs  = require('express-handlebars');

// view engine setup
app.engine('hbs', exphbs({
  // handlebars     : Handlebars,
  extname: '.hbs',
  layoutsDir     : path.join(__dirname, 'views', 'layouts'),
  partialsDir    : path.join(__dirname, 'views', 'partials'),
  defaultLayout  : path.join(__dirname, 'views', 'layouts', 'layout.hbs'),
  helpers        : undefined,
  compilerOptions: undefined
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.locals.title = 'Sequence Viewer';

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (process.argv.slice(2).filter((s) => s.indexOf("-v") > -1 || s.indexOf("--verbose") > -1).length) {
app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(require('crypto').randomBytes(64).toString('hex')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
