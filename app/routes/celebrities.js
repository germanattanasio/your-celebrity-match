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

var router = require('express').Router(),
  mongoose = require('mongoose'),
  fs       = require('fs'),
  Q        = require('q'),
  Profile  = mongoose.model('Profile'),
  User     = mongoose.model('User');

/**
 * Render the celebrity list
*/
router.get('/', function(req,res) {
  Profile.find({},function(err,profiles){
    if (err)
      res.render('celebrities',{error: err});
    else
      res.render('celebrities',{profiles: profiles});
  });
});

/**
 * Render the celebrity list
*/
router.get('/users', function(req,res) {
  User.find({},function(err,profiles){
    if (err)
      res.render('celebrities',{error: err});
    else
      res.render('celebrities',{profiles: profiles});
  });
});


var getUserId = function(text) {
  return text.replace('.json','');
};

var jsonProfiles = function(text) {
  return text.indexOf('.json', text.length - '.json'.length) !== -1;
};

/**
 * Validate twitter usernames
*/
router.post('/syncdb', function (req, res) {
  console.log('update celebrity database');
  var removeAll = Q.denodeify(Profile.remove.bind(Profile)),
    getFiles = Q.denodeify(fs.readdir),
    getUsers = Q.denodeify(req.twit.getUsers.bind(req.twit)),
    getFile = Q.denodeify(fs.readFile);

  var newUsers;
  removeAll({})
  .then(function() {
    return getFiles('./profiles');
  })
  .then(function(files){
    if (!files || files.length === 0)
      return;

    var user_ids = files.filter(jsonProfiles).map(getUserId),
      count = Math.ceil(user_ids.length / 100),
      promises = [];

    for (var i = 0; i < count; i++) {
      var ids = user_ids.slice(0,100);
      user_ids = user_ids.slice(Math.min(100, user_ids.length));
      promises.push(getUsers({user_id:ids.join(',')}));
    }
    return Q.all(promises);
  })
  .then(function(usersArray){
    var users = [];
    usersArray.forEach(function(_users){
      users = users.concat(_users);
    });
    newUsers = usersArray;

    return Q.all(users.map(function(u){
      getFile('./profiles/'+u.id+'.json')
      .then(function(profileJson) {
        u.profile = profileJson;
        return Profile.create(u).exec();
      });
    }));
  })
  .then(function(){
    res.json({success:true, profiles:newUsers});
  })
  .catch(function (error) {
    console.log('error', error);
    res.json({success:false, error:error});
  });
});

/**
 * Add a celebrity to the list
*/
router.post('/add/@:username', function(req,res) {
  var username = req.params.username;
  console.log(username);
  // Check if the user exists
  Profile.findOne({username:username}, function(err,profile) {
    if (err)
      res.json({success:false, error: err});
    else if (profile) {
      console.log('User is already in the database');
      res.json({success:false, error: 'User is already in the database'});
    }
    else {
      // Check if the user is verified, >10k followers, and >1k tweets
      var showUser = Q.denodeify(req.twit.showUser.bind(req.twit));
      showUser(username)
      .then(function(user) {
        if (!user.verified || user.tweets < 1000 || user.followers < 10000)
          res.json({success:false, error: 'User does not qualify as a celebrity'});
        else if (user.protected)
          res.json({success:false, error: 'User is protected and cannot be added'});
        else {
          // Get the tweets, profile and add him to the database
          var getTweets = Q.denodeify(req.twit.getTweets.bind(req.twit));
          return getTweets(username)
          .then(function(tweets) {
            console.log(username, 'has', tweets.length, 'tweets');
            var getProfile = Q.denodeify(req.personality_insights.profile.bind(req.personality_insights));
            return getProfile({contentItems:tweets})
            .then(function(profile) {
              if (!profile)
                return;
              console.log(username, 'analyze with personality insights');

              console.log(username, 'added to the database');
              user.profile = JSON.stringify(profile);
              var saveProfileInDB = Q.denodeify(Profile.createOrUpdate.bind(Profile));
              return saveProfileInDB(user);
            });
          })
          .then(function(dbUser) {
            if (!dbUser) return;
            res.json({success:true, profile: dbUser});

            // return null because we already fulfill the response
            return null;
          });
        }
      })
      .catch(function (error) {
        console.log('catch():', error);
        var err,
          status = 500;
        if (error.statusCode === 429)
          err = 'Twitter rate limit exceeded, come back in 15 minutes.';
        else if (error.statusCode === 503)
          err = 'The Twitter servers are overloaded with requests. Try again later.';
        else if (error.statusCode === 404) {
          err = 'Sorry, @' + username + ' does not exist.';
          status = 404;
        } else {
          err = 'Sorry, there was an error. Please try again later.';
        }

      res.status(status);
      res.json({success:false, error: err});

      // return null because we already fulfill the response
      return null;
      });
    }
  });
});

/**
 * Render the celebrity list
*/
router.post('/remove/@:username', function(req,res) {
  var username = req.params.username;
  Profile.remove({username:username},function(err, result){
    if (err)
      res.json({success:false, error: err});
    else {
      res.json({success:true, username: username});
    }
  });
});

module.exports = router;
