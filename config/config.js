'use strict';

var logger = require('./logger'),
  bluemix  = require('./bluemix'),
 env       = process.env.VCAP_SERVICES ? 'prod' : 'dev';

var services = {
  mongodb: 'mongodb://localhost/celebs',

  user_modeling: {
    url:      '<url>',
    username: '<username>',
    password: '<password>'
  },

  twitter: [{
    consumer_key:       '<consumer_key>',
    consumer_secret:    '<consumer_secret>',
    access_token_key:   '<access_token_key>',
    access_token_secret:'<access_token_secret>'
  }]
};


// Get the service
if (env === 'prod') {
  services.mongodb = bluemix.serviceStarsWith('mongodb').url;
  services.user_modeling = bluemix.serviceStarsWith('user_modeling');
}

logger.info('mongodb:',services.mongodb);
logger.info('user_modeling:',services.user_modeling);

module.exports = {
    services: services,
    host: '127.0.0.1',
    port: 3000
};

