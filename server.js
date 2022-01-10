/*
 * ElderPass - Check students in and out of Flex time
 * Written by: Zack Sargent (add your name here)
 * Jan/2022
 */

// dotenv gets the secrets we keep in the `.env` file.
const dotenv = require('dotenv');
// express is the web framework we are using to host files
// and serve the REST api
const express = require('express');
// create a server for express to listen on
const http = require('http');
// access local files
const path = require('path');
// these are all of the routes for the URL
const router = require('./routes/index');
// auth is provided by Auth0 (we get 7,000 signups for free)
const { auth } = require('express-openid-connect');
// logging middleware
const morgan = require('morgan');
// rfs breaks up log files
const rfs = require("rotating-file-stream");
const rfsStream = rfs.createStream("morgan.log", {
  interval: '1d', // rotate daily
  compress: 'gzip', // compress rotated files
  path: path.join(__dirname, 'logs/morgan')
});

dotenv.load();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('common', {
    stream: rfsStream
}));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });
