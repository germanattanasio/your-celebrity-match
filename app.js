/* Copyright IBM Corp. 2015
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
  PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3'),
  TwitterHelper = require('./app/util/twitter-helper');



// Load Mongoose Schemas
require('./app/models/profile');
require('./app/models/user');

// Mongoose by default sets the auto_reconnect option to true.
// Recommended a 30 second connection timeout because it allows for
// plenty of time in most operating environments.
var connect = function () {
  console.log('connect-to-mongodb');
  var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
  };
  mongoose.connect(config.mongodb, options);
};
connect();

mongoose.connection.on('error', console.log.bind(console, 'mongoose-connection-error:'));
mongoose.connection.on('open', console.log.bind(console,'connect-to-mongodb'));
mongoose.connection.on('disconnected', connect);

// Bootstrap application settings
require('./config/express')(app);

// Create the twitter helper
var twit = new TwitterHelper(config.twitter);

// Create the personality insights service
var personality_insights = new PersonalityInsightsV3(config.personality_insights);

// Make the services accessible to the router
app.use(function(req,res,next){
  req.twit = twit;
  req.personality_insights = personality_insights;
  next();
});

// Bootstrap routes
require('./app/routes/index')(app);

// Global error handler
require('./config/error-handler')(app);

module.exports = app;