/**
 * Export loggers for ease of use and consistency
 */

"use strict";
const path = require('path');

// logging middleware
const morgan = require('morgan');
// rfs breaks up log files
const rfs = require("rotating-file-stream");
const rfsStream = rfs.createStream("morgan.log", {
  interval: '1d', // rotate daily
  compress: 'gzip', // compress rotated files
  path: path.join(__dirname, '../logs/morgan')
});
const morganMode = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms';

// bunyan is for more descriptive logging
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: 'ElderPass',
  streams: [{
    level: 'trace',
    type: 'rotating-file',
    path: path.join(__dirname, '../logs/bunyan/elderpass.log'),
    period: '1d',   // rotate logs every day
    count: 10       // keep 10 back copies
  }, {
    level: 'debug',
    stream: process.stdout
  }]
});

module.exports = {
  morgan,
  logger,
  morganMode,
  rfsStream
}

