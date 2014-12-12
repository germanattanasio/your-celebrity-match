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

module.exports = function (app) {
  app.use('/celebrities', require('./celebrities'));
  app.use('/', require('./user'));

  app.use('/tos', function(req, res) {
    res.render('tos');
  });
    // HTTP 500
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('500', { error: err });
  });

  // HTTP 404
  app.use(function(req, res){
    res.status(404);
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }
    res.type('txt').send('Not found');
  });

};