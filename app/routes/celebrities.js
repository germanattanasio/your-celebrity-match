/* Copyright IBM Corp. 2014
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
  User     = mongoose.model('User'),
  logger   = require('../../config/logger');


/**
 * Render the celebrity list
*/
router.get('/secret', function(req,res) {
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
router.get('/secret/users', function(req,res) {
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
router.get('/secret/syncdb', function (req, res) {
  logger.info('update celebrity database');
  var removeAll = Q.nfbind(Profile.remove.bind(Profile)),
    getFiles = Q.denodeify(fs.readdir),
    getUsers = Q.denodeify(req.twit.getUsers.bind(req.twit)),
    getFile = Q.denodeify(fs.readFile);

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

    logger.info(users.length);
      return Q.all(users.map(function(u){
        getFile('./profiles/'+u.id+'.json')
        .then(function(profileJson) {
          u.profile = profileJson;
          return Profile.create(u).exec();
        });
      }));
  })
  .then(function(){
    res.redirect('/celebrities/secret');
  })
  .fail(function (error) {
    logger.error(error);
    res.render('celebrities',{error:error});
  });
});

module.exports = router;
