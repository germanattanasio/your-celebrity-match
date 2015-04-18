'use strict';

var logger = require('./logger'),
  bluemix  = require('./bluemix'),
  extend   = require('extend'),
  env      = process.env.VCAP_SERVICES ? 'prod' : 'dev';

var services = {
  mongodb: 'mongodb://localhost/celebs',

  personality_insights: {
    url:      '<url>',
    username: '<username>',
    password: '<password>',
    version: 'v2'
  },

  twitter: [
  // Twitter app credentials: https://apps.twitter.com/app
  {
    consumer_key:       '<consumer_key>',
    consumer_secret:    '<consumer_secret>',
    access_token_key:   '<access_token_key>',
    access_token_secret:'<access_token_secret>'
  }]
};


// Get the service
if (env === 'prod') {
  services.mongodb = bluemix.serviceStarsWith('mongodb').url;
  services.personality_insights = extend({'version':'v2'}, bluemix.serviceStartsWith('personality_insights'));
}

logger.info('mongodb:',services.mongodb);
logger.info('personality_insights:',services.personality_insights);

module.exports = {
    services: services,
    host: '127.0.0.1',
    port: 3000
};
