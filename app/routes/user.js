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

var router   = require('express').Router(),
  flatten    = require('../util/flatten'),
  mongoose   = require('mongoose'),
  Q          = require('q'),
  Profile    = mongoose.model('Profile'),
  User       = mongoose.model('User'),
  extend     = require('extend'),
  util       = require('../util/util');

// We're only going to hit the db once for these
var pics = [];
var celebs =[];
var getCelebrityFromDB = Q.denodeify(Profile.find.bind(Profile));

/**
 * Updates an array with the celebrity profile pictures.
 */
function updateBackground() {
  getCelebrityFromDB({}).then(function(profiles) {
    celebs = profiles;
    var images = profiles.map(function(profile) {
      return {
        username: '@' + profile.username,
        image: profile.image
      };
    });

    // make sure we have at least 24 pictures by concatenating them.
    while(images.length > 0 && images.length < 24) {
      images = images.concat(images); // note: this grows exponentially
    }
    pics = shuffle(images);
  });
}
updateBackground();


// Suffle an array with images and username
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Render the home page
router.get('/', function (req, res) {
  updateBackground();
  res.render('index',{pics:pics});
});

router.post('/', function(req, res) {
  var username = req.body.username;
  if (username && username.substr(0,1) !== '@') {
    username = '@' + username;
  }
  res.redirect(username ? '/like/' + username : '/');
});

/**
 * Retrieve tweets from a given username and analyze them
 * by using the personality insights service
*/
router.get('/like/@:username', function (req, res) {
  var username = req.params.username;
  if (!username)
    return res.render('index', {info: 'You need to provide a username.',pics:pics});

  // Declare some promises to handle database/twitter and personality_insights req
  var showUser   = Q.denodeify(req.twit.showUser.bind(req.twit)),
    getTweets  = Q.denodeify(req.twit.getTweets.bind(req.twit)),
    getProfile = Q.denodeify(req.personality_insights.profile.bind(req.personality_insights)),
    getUserFromDB = Q.denodeify(User.findOne.bind(User)),
    saveUserInDB = Q.denodeify(User.createOrUpdate.bind(User));

  showUser(username)
  .then(function(user) {
    console.log('username:', username);

    if (!user)
      return;
    else if (user.protected)
      return res.render('index',
        { info: '@'+username+' is protected, try another one.', pics: pics});

    return getCelebrityFromDB({id:user.id})
    .then(function(celebrity){
      if (celebrity && celebrity.length === 0) {
        console.log(user.username,'is not a celebrity, lets see if is in the DB');
        return getUserFromDB({id:user.id})
        .then(function(dbUser) {
          if (dbUser) {
            console.log(username, 'found in the database');
            return extend(dbUser,user);
          }
          else {
            console.log(username, 'is a new user, lets get his tweets');

            // Get the tweets, profile and add him to the database
            return getTweets(username)
              .then(function(tweets) {
                console.log(username, 'has', tweets.length, 'tweets');
                return getProfile({contentItems:tweets})
                .then(function(profile) {
                  if (!profile)
                    return;
                  console.log(username, 'analyze with personality insights');

                  console.log(username, 'added to the database');
                  user.profile = JSON.stringify(profile);
                  return saveUserInDB(user);
                });
              });
          }
        });
      } else {
        console.log(user.username,'is a celebrity, we return the profile from the DB');
        return extend(celebrity[0], user);
      }
    })
    .then(function(dbUser) {
      if (!dbUser) return;
      console.log(dbUser.username,'to be comparted to:',celebs.length,'celebrities');
      var distances = util.calculateDistances(dbUser, celebs);
      // Remove celebrities to match to themselves
      if (distances[0].distance === 1.00)
        distances = distances.slice(1);

      var ret = {
        user: dbUser,
        user_profile: flatten.big5(dbUser.profile),
        // return only the 6 most similar/different profiles
        similar_celebs: distances.slice(0, Math.min(6, distances.length)),
        different_celebs: distances.reverse().slice(0, Math.min(6, distances.length)),
        pics: pics
      };
      // Check if the results could be inacurrate because of the number of tweets
      if (dbUser.tweets < 200)
        ret.info = 'The more tweets you have, the more accurate your results'+
        ' will be. 200 or more tweets give the best results';
      return ret;
    });
  })
  .catch(function (error) {
    console.log('catch():', error);
    var ret = { pics:pics, user: { screen_name: username}};
    var status = 500;
    if (error.statusCode === 429)
      ret.info = 'Twitter rate limit exceeded, come back in 15 minutes.';
    else if (error.statusCode === 404) {
      ret.info = 'Sorry, @' + username+' does not exist.';
      status = 404;
    } else if (error.error || error.error_code) {
      ret.info = 'Sorry, our analysis requires 100 unique words. ' +
        'We weren\'t able to find that many words in @'+ username+' tweets.';
      status = 400;
    } else {
      ret.error = 'Sorry, there was an error. Please try again later.';
    }

    res.status(status);
    res.render('index', ret);

    // return null because we already fulfill the response
    return null;

  }).done(function(result){
    console.log('done()');
    if (result)
      res.render('match', result);
  });
});

router.get('/like/:username', function(req, res) {
  res.redirect('/like/@' + req.params.username);
});


router.get('/syncdb', function (req, res) {
  console.log('remove users from database');
  var removeAll = Q.nfbind(User.remove.bind(User));

  removeAll({}).then(function(){
    res.redirect('/');
  })
  .catch(function (error) {
    console.log('error', error);
    res.redirect('/');
  });
});

module.exports = router;
