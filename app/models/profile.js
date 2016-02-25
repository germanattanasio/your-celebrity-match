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

var mongoose = require('mongoose'),
  extend = require('extend');

var ProfileSchema = mongoose.Schema({
  name:      String,
  username:  String,
  profile:   String,
  followers: Number,
  tweets:    Number,
  id:        String,
  image:     String
});

// Create a new user or update the existing one
ProfileSchema.statics.createOrUpdate = function(profile, done){
  var Profile = this;
  // Build dynamic key query
  var query = { username: profile.username };

  // Search for a profile from the given auth origin
  Profile.findOne(query, function(err, user){
      if(err) return done(err);
      if(user) {
        extend(user,profile);
        user.save(function(err, user){
          if(err) return done(err);
          done(null, user);
        });
      } else {
        // New user, create
        Profile.create(
          extend({},profile),
          function(err, user){
            if(err) return done(err);
            done(null, user);
          }
        );
      }
    });
};

module.exports = mongoose.model('Profile', ProfileSchema);
