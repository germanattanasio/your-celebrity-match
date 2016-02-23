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
/*global $:false */

'use strict';
var currentType;

// Constants for types of profiles
var PERSONALITY = 0,
    NEEDS = 1,
    VALUES = 2;

/**
 * Display a celebrity and its traits
 * @param  {Object} celebrity the object with the twitter user,
 * profile and distance
 */
function displayCelebrity(celebrity) {
  $('.cel_name').text(celebrity.user.name);
  $('.cel_username').text('@' + celebrity.user.username);
  $('.cel_username').attr('href', 'https://twitter.com/' + celebrity.user.username);
  $('.cel_distance').text(Math.round(celebrity.distance * 100) + '%');
  $('.cel_image').attr('src', celebrity.user.image.replace('_normal', '_400x400'));

  // Update traits
  var idType;
  if (currentType === PERSONALITY) idType = '#personality_trait_';
  else if (currentType === NEEDS) idType = '#needs_trait_';
  else if (currentType === VALUES) idType = '#values_trait_';
  celebrity.profile.forEach(function(trait, i) {
    $(idType + i).css('left', 'calc(' + (trait.value * 100) + '%)');
  });
}

/**
 * Makes updates for a profile type switch
 */
function switchTypeUpdates(type, newCeleb, showClass, hideClass1, hideClass2, showSwitch, hideSwitch1, hideSwitch2) {
  if (currentType === type)
    return;
  currentType = type;
  displayCelebrity(newCeleb);

  // Make DOM class updates
  $(showClass).removeClass('hide-traits');
  $(hideClass1).addClass('hide-traits');
  $(hideClass2).addClass('hide-traits');
  $(showSwitch).addClass('switch-button-active');
  $(showSwitch).removeClass('switch-button-disabled');
  $(hideSwitch1).addClass('switch-button-disabled');
  $(hideSwitch1).removeClass('switch-button-active');
  $(hideSwitch2).addClass('switch-button-disabled');
  $(hideSwitch2).removeClass('switch-button-active');
}

/**
 * On click handlers for changing comparison views
 * Get the celeb id and call displayCelebrity if it exists
 * @param  {Object} e event
 */
$(document).on('click', '.personality-switch', function() {
  switchTypeUpdates(PERSONALITY, similar_personalities[0], '.personality', '.needs', '.values', '.personality-switch', '.needs-switch', '.values-switch');
});
$(document).on('click', '.needs-switch', function() {
  switchTypeUpdates(NEEDS, similar_needs[0], '.needs', '.personality', '.values', '.needs-switch', '.personality-switch', '.values-switch');
});
$(document).on('click', '.values-switch', function() {
  switchTypeUpdates(VALUES, similar_values[0], '.values', '.needs', '.personality', '.values-switch', '.needs-switch', '.personality-switch');
});

/**
 * On click handler for celebrity images.
 * Get the celebrity id and call displayCelebrity if it exists
 * @param  {Object} e event
 */
$('.avatar-small').click(function(e) {
  var celebrity;
  var id = $(this).find('img').prop('id');
  if (id.match('^s_')) {
    if (currentType === PERSONALITY) celebrity = similar_personalities[id.slice(2)];
    else if (currentType === NEEDS) celebrity = similar_needs[id.slice(2)];
    else if (currentType === VALUES) celebrity = similar_values[id.slice(2)];
  }
  else {
    if (currentType === PERSONALITY) celebrity = different_personalities[id.slice(2)];
    else if (currentType === NEEDS) celebrity = different_needs[id.slice(2)];
    else if (currentType === VALUES) celebrity = different_values[id.slice(2)];
  }

  if (celebrity)
    displayCelebrity(celebrity);
  else
    console.log('celebrity not found!');

});

/**
 * On click handler for unhiding .overlay-screen.how-it-worked popup overlay.
 */
$(document).on('click', '.how-it-works-link', function() {
  $('.overlay-screen.how-it-worked').fadeIn(200);
  $('#wrap').css({
    'overflow': 'hidden',
    'height': '100%'
  });
});

/**
 * On click handler for hiding .overlay-screen.how-it-worked popup overlay.
 */
$(document).on('click', '.button.back', function() {
  $('.overlay-screen.how-it-worked').fadeOut(200);
  $('#wrap').css({
    'overflow': 'none',
    'height': 'auto'
  });
});

/**
 * On hover handler for making user's points bigger and celeb's points smaller
 */
$(document).on('mouseenter', '.avatars-row > .me', function() {
  $('.mep').addClass('bigger');
  $('.celebrityp').addClass('smaller');
});
$(document).on('mouseleave', '.avatars-row > .me', function() {
  $('.mep').removeClass('bigger');
  $('.celebrityp').removeClass('smaller');
});

/**
 * On hover handler for making celeb's points bigger and user's points smaller
 */
$(document).on('mouseenter', '.avatars-row > .celebrity', function() {
  $('.mep').addClass('smaller');
  $('.celebrityp').addClass('bigger');
});
$(document).on('mouseleave', '.avatars-row > .celebrity', function() {
  $('.mep').removeClass('smaller');
  $('.celebrityp').removeClass('bigger');
});

/**
 * On load handler for loading images a little more gracefully
 */
$('.page-content img').on('load', function() {
  // $(this).addClass('revealed');
  $(this).addClass('revealed');
}).each(function() {
  if (this.complete) {
    $(this).load();
  }
});

$(document).ready(function() {
  currentType = PERSONALITY;
  displayCelebrity(similar_personalities[0]);
});
