var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var productsRouter = require('./routes/product');
var ordersRouter = require('./routes/order');
var basketRouter = require('./routes/basket');
var notificationRouter = require('./routes/notification');
var favoriteRouter = require('./routes/favorite');
var app = express();
var cors = require('cors');


app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware - place it before your routes
app.use(cors({
  origin: ['http://localhost:3002',
  'http://localhost:3003'
], // frontend'in URL'si
  credentials: true
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/product', productsRouter);
app.use('/order', ordersRouter);
app.use('/basket', basketRouter);
app.use('/notification', notificationRouter);
app.use('/favorite', favoriteRouter);

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
