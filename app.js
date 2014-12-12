/*jshint node:true*/
'use strict';

var express     = require('express'),
  app           = express(),
  config        = require('./config/config'),
  mongoose      = require('mongoose'),
  UserModeling  = require('./app/util/user_modeling'),
  twitterHelper = require('./app/util/twitter-helper'),
  logger        = require('./config/logger');


// Load Mongoose Schemas
require('./app/models/profile');
require('./app/models/user');

// Mongoose by default sets the auto_reconnect option to true.
// Recommended a 30 second connection timeout because it allows for
// plenty of time in most operating environments.
var connect = function () {
  logger.profile('connect-to-mongodb');
  var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
  };
  mongoose.connect(config.services.mongodb, options);
};
connect();

mongoose.connection.on('error',
  logger.error.bind(logger, 'mongoose-connection-error:'));
mongoose.connection.on('disconnected', connect);
mongoose.connection.on('open',
  logger.profile.bind(logger,'connect-to-mongodb'));


// Bootstrap application settings
require('./config/express')(app);

// Create the twitter helper
var twit = new twitterHelper(config.services.twitter);

// Create the user modeling service
var user_modeling = new UserModeling(config.services.user_modeling);

// Make the services accessible to the router
app.use(function(req,res,next){
  req.twit = twit;
  req.user_modeling = user_modeling;
  next();
});

// Bootstrap routes
require('./app/routes/index')(app);

// Start the server
var host = (process.env.VCAP_APP_HOST || config.host);
var port = (process.env.VCAP_APP_PORT || config.port);
app.listen(port, host);
// app.listen(port);
logger.info('App listening on:',port);