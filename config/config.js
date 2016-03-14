/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

module.exports = {
  // Mongo database url
  mongodb: process.env.MONGODB || 'mongodb://localhost/celebs',

  // Personality Insights credentials
  personality_insights: {
    url: "https://gateway.watsonplatform.net/personality-insights/api",
    username: "35dc9810-bed6-401d-a011-b236dfc9ad3f",
    password: "QxRmglCc6koE",
    version: 'v2'
  },

  // Twitter app credentials: https://apps.twitter.com/app
  twitter: process.env.TWITTER ? JSON.parse(process.env.TWITTER) : [{
    consumer_key: '<consumer_key>',
    consumer_secret: '<consumer_secret>',
    access_token_key: '<access_token_key>',
    access_token_secret: '<access_token_secret>'
  }]
};
