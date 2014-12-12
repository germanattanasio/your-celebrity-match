'use strict';

// Module dependencies
var express     = require('express'),
  bodyParser    = require('body-parser'),
  errorhandler  = require('errorhandler'),
  favicon       = require('express-favicon'),
  morgan        = require('morgan'),
  logger        = require('./logger');

var env = process.env.VCAP_SERVICES ? 'production' : 'development';

module.exports = function (app) {

  // Setup middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Setup static public directory
  app.use(express.static(__dirname + '/../app/public'));
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/../app/views');
  app.use(favicon(__dirname + '/../app/public/images/favicon.ico'));

  // Ovverride Express logger with our morgan logger
  app.use(morgan('short',{ 'stream': logger.stream }));

  // Add error handling in dev
  if (env === 'development') {
    app.use(errorhandler());
  }
};