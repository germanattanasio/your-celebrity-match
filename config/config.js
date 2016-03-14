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
    url: '<url>',
    username: '<username>',
    password: '<password>',
    version: 'v2'
  },

  // Twitter app credentials: https://apps.twitter.com/app
  twitter: process.env.TWITTER ? JSON.parse(process.env.TWITTER) : [{
    consumer_key: 'aZL4FHo19lLD0kyDvFCMi8hhb',
    consumer_secret: '6LQsuP85P202s4W5LwTm4W0yQFYG8Hx6ttXiZ8FV7ZSghzaMq5',
    access_token_key: '14554287-z7A1mlNHy2jyy2rBMdq0PgymNdw7uftSAWyZChSAU',
    access_token_secret: '6i6kMYHmvlEUiMYCsLz0NOB7sV5Ed5xgvIfyELIp89caR'
  }]
};
