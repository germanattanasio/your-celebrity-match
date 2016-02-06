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

'use strict';

var util  = require('util'),
  twitter = require('twitter'),
  pi_util = require('../util/util');

var MAX_COUNT = 200;

/**
 * Create a TwitterHelper object
 * @param {Object} config configuration file that has the
 * app credentials.
 */
function TwitterHelper(configs) {
  this.count = 0;
  this.twit = [];
  var self = this;

  configs.forEach(function(config){
    self.twit.push(new twitter(config));
  });
}

TwitterHelper.prototype.getInstance = function() {
  var instance = this.count % this.twit.length;
  this.count ++;

  console.log('instance', instance);
  return this.twit[instance];
};

/**
 * @return {boolean} True if tweet is not a re-tweet or not in english
 */
var englishAndNoRetweet = function(tweet) {
  return tweet.lang === 'en' && !tweet.retweeted;
};

/**
 * Get the tweets based on the given screen_name.
 * Implemented with recursive calls that fetch up to 200 tweets in every call
 * Only returns english and original tweets (no retweets)
 */
TwitterHelper.prototype.getTweets = function(screen_name, callback) {
  console.log('getTweets for:', screen_name);

  var self = this,
    tweets = [],
    params = {
      screen_name: screen_name,
      count: MAX_COUNT,
      exclude_replies: true,
      trim_user:true};

  var processTweets = function(_tweets) {
    // Check if _tweets its an error
    if (!util.isArray(_tweets))
      return callback(_tweets,null);

    var items = _tweets
    .filter(englishAndNoRetweet)
    .map(pi_util.toContentItem);

    tweets = tweets.concat(items);
    console.log(screen_name,'_tweets.count:',tweets.length);
    if (_tweets.length > 1) {
      params.max_id = _tweets[_tweets.length-1].id - 1;
      self.getInstance().getUserTimeline(params, processTweets);
    } else {
       callback(null, tweets);
    }
  };
  self.getInstance().getUserTimeline(params, processTweets);
};

/**
 * Get twitter user from a screen_name or user_id array
 * It looks at params to determinate what to use
 */
TwitterHelper.prototype.getUsers = function(params, callback) {
  console.log('getUsers:', params);

  this.getInstance().post('/users/lookup.json',params,function(tw_users) {
    if (tw_users.statusCode){
      console.log('error getting the twitter users');
      callback(tw_users);
    } else
      callback(null, tw_users.map(pi_util.toAppUser.bind(pi_util)));
  });
};

/**
 * Show Twitter user information based on screen_name
 */
TwitterHelper.prototype.showUser = function(screen_name, callback) {
  this.getInstance().showUser(screen_name, function(user){
    if (user.statusCode){
      console.log(screen_name, 'is not a valid twitter');
      callback(user);
    } else
      callback(null, pi_util.toAppUser(user));
  });
};

module.exports = TwitterHelper;