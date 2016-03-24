/* Copyright IBM Corp. 2016
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
 Q          = require('q'),
 mongoose   = require('mongoose'),
 Profile    = mongoose.model('Profile'),
 User       = mongoose.model('User'),
 extend     = require('extend'),
 util       = require('../util/util'),
 Client = require('node-rest-client').Client;

var client = new Client();
var pics = [];
var celebs =[];
var getCelebrityFromDB = Q.denodeify(Profile.find.bind(Profile));

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
	
function getDiffProfiles(user, celebs, type) {
	  var distances = util.calculateDistances(user, celebs, type);

	  // Remove celebrities to match to themselves
	  if (distances[0].distance === 1.00)
	    distances = distances.slice(1);

	  // Return 6 most similar and different profiles
	  return {
	    similar: distances.slice(0, Math.min(6, distances.length)),
	    different: distances.reverse().slice(0, Math.min(6, distances.length))
	  };
}


router.post('/', function(req, res) {
 var username = req.body.username;
 if (username && username.substr(0,1) !== '@') {
   username = '@' + username;
 }
 res.redirect(username ? '/insta/like/' + username : '/');
});


/**
* given username Get the URLs Call Image2Personality API
*/
router.get('/like/@:username', function (req, res) {
 var username = req.params.username.toLowerCase();
 var result;
 try {
	 console.log('username ' + username);
	 if (!username)
	   return res.render('index', {info: 'You need to provide a username.',pics:pics});
	 client.registerMethod("postMtd", "http://image2personality.mybluemix.net/ocean", "POST");
	 
	   	// get the data
	   	var postData = { source : "image", instagramID : username};
        var restArgs = {
       		  data : postData,
       		  headers: { "Content-Type": "application/json" }
         };

        client.methods.postMtd(restArgs, function (data, response) {
       	  if (!data || !data.status){
       		  console.log("cannot find data or data.status");
       		return res.render('index',
  			        {info: 'Sorry, remote server has a problem, please try again in 15 minutes',pics:pics});
       	  }
       	  var status = data.status;
       	  console.log("status " + status);
       	  if (status !== 'OK') {
       		return res.render('index', {info: 'You  do not have enough images or your account does not exist',pics:pics});
       	  } else {
       		  var resolved_profile = flatten.impressions(data);
       		  var imgs2Show = data.displayImageURL;
       		  console.log(username + " Analyzed with image impression");
       		  var dbUser = {
       	        	  name:      username,
       	        	  username:  username,
       	        	  id:        username,
       	        	  image:     imgs2Show[0],
       	        	  profile:   resolved_profile
       	        	};
       		  
       		  var personalityDiff = getDiffProfiles(dbUser, celebs, 10),
       		
       		  result = {
       		        user: dbUser,
       		        // return the flattened user profiles for each type
       		        user_profile: {
       		          personality: resolved_profile,
       		          needs: [],
       		          values: []
       		        },
       		        similar_personalities: personalityDiff.similar,
       		        different_personalities: personalityDiff.different,
       		        pics: pics
       		      };
       		  res.render('match',result);
       	  }
       	});
 } 
 catch(error) {
   console.log('catch():' + JSON.stringify(error));
   var ret = {pics:pics, user: {screen_name:username}};
   var status = 500;
   ret.error = 'Sorry, there was an error. Please try again later.';
   res.status(status);
   res.render('index',ret);
 }
 finally {
   console.log('done()');
   if (result) {
     res.render('match',result);
   } 
 }
});

module.exports = router;
