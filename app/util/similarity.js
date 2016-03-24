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
 * Return the euclidean distance between two profiles
 * @param  json origin The personality insights profile
 * @param  json target The personality insights profile
 * @param  int  type   Type of trait being compared
 * @return Array      The 5 main traits
 */
var similarity = function( /*object*/ origin, /*object*/ target, type) {
  target = typeof(target) === 'string' ? JSON.parse(target) : target;
  var distance = 0.0,
    target_traits = target.tree.children[type%10].children[0].children,
    traits_size = 0;
  if (type == 10) { // instgram input
	  traits_size = origin.length;
	  origin.forEach(function(trait, i) {
		  distance += Math.pow(trait.value - target_traits[i].percentage, 2);
	  });
  } else {
	  origin = typeof(origin) === 'string' ? JSON.parse(origin) : origin;
	  var origin_traits = origin.tree.children[type%10].children[0].children;
	  traits_size = origin_traits.length;
	  origin_traits.forEach(function(trait, i) {
		    distance += Math.pow(trait.percentage - target_traits[i].percentage, 2);
		  });
  }
  var ret = 1 - (Math.sqrt(distance / traits_size));
  return ret;
};

module.exports = similarity;
