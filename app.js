/* Copyright IBM Corp. 2014
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint node:true*/

'use strict';

var express     = require('express'),
  app           = express(),
  config        = require('./config/config'),
  mongoose      = require('mongoose'),
  watson        = require('watson-developer-cloud'),
  TwitterHelper = require('./app/util/twitter-helper'),
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

mongoose.connection.on('error', logger.error.bind(logger, 'mongoose-connection-error:'));
mongoose.connection.on('open', logger.profile.bind(logger,'connect-to-mongodb'));
mongoose.connection.on('disconnected', connect);

// Bootstrap application settings
require('./config/express')(app);

// Create the twitter helper
var twit = new TwitterHelper(config.services.twitter);

// Create the personality insights service
var personality_insights = new watson.personality_insights(config.services.personality_insights);

// Make the services accessible to the router
app.use(function(req,res,next){
  req.twit = twit;
  req.personality_insights = personality_insights;
  next();
});

// Bootstrap routes
require('./app/routes/index')(app);

// Start the server
var host = (process.env.VCAP_APP_HOST || config.host);
var port = (process.env.VCAP_APP_PORT || config.port);

app.listen(port, host);
logger.info('App listening on:',port);
