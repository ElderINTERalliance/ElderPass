/*
 * ElderPass - Check students in and out of Flex time
 * Written by: Zack Sargent (add your name here)
 */

/**
 * @module MainServer
 */

"use strict";

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
const apiRouter = require('./routes/api');
// auth is provided by Auth0 (we get 7,000 signups for free)
const { auth } = require('express-openid-connect');
const { morgan, logger, morganMode, rfsStream } = require("./src/loggers");

process.env.TZ = "America/New_York"; // the time zone this server should be operating in

dotenv.load();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan(morganMode, {
  stream: rfsStream
}));
app.use(morgan('dev'));

app.use("/public", express.static(path.join(__dirname, 'public')));
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

/**
 * @name /
 * @description route to the [router]{@link module:Router}
 */
app.use('/', router);

/**
 * @name /api
 * @description route to the [API]{@link module:API}
 */
app.use('/api', apiRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  logger.error(JSON.stringify(err));
  logger.trace(req);

  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

http.createServer(app)
  .listen(port, () => {
    logger.info(`Listening on ${config.baseURL}`);
  });
