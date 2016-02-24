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

/**
 * Return the desired Traits normalized
 * @param  {tree}     JSON personality results object
 * @param  int type   type of personality results being normalized
 * @return Array      The normalized traits
 */
var traits = function(tree, type) {
  var profile = typeof(tree) === 'string' ? JSON.parse(tree) : tree;
  var _traits = profile.tree.children[type].children[0].children;
  return _traits.map(function(trait) {
    return {
      name: trait.name,
      value: trait.percentage
    };
  });
};

module.exports.traits = traits;
