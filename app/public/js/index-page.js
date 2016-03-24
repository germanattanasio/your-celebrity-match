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
(function($) {
    
    $.Loadingdotdotdot = function(el, options) {
        
        var base = this;
        var speed = 300;
        var maxDots = 9;
        
        base.$el = $(el);
                
        base.$el.data("Loadingdotdotdot", base);
        
        base.dotItUp = function($element, maxDots) {
            if ($element.text().length == maxDots) {
                $element.text("");
            } else {
                $element.append(".");
            }
        };
        
        base.stopInterval = function() {    
            clearInterval(base.theInterval);
        };
        
        base.init = function() {
            
            base.speed = speed;
            base.maxDots = maxDots;
                                    
            base.options = $.extend({},$.Loadingdotdotdot.defaultOptions, options);
                        
            base.$el.html("<span>" + base.options.word + "<strong></strong></span>");
            base.$el.css("font-size", "1.5rem");
            base.$dots = base.$el.find("strong");
            base.$loadingText = base.$el.find("span");
                        
            base.theInterval = setInterval(base.dotItUp, base.options.speed, base.$dots, base.options.maxDots);
            
        };
        
        base.init();
    
    };
    
    $.Loadingdotdotdot.defaultOptions = {
        speed: 300,
        maxDots: 15,
        word: "Loading"
    };
    
    $.fn.Loadingdotdotdot = function(options) {
        
        if (typeof(options) == "string") {
            var safeGuard = $(this).data('Loadingdotdotdot');
			if (safeGuard) {
				safeGuard.stopInterval();
			}
        } else { 
            return this.each(function(){
                (new $.Loadingdotdotdot(this, options));
            });
        } 
        
    };
    
})(jQuery);

$(function() {
    
	$(".tryButton").click(function() {
		$('.overlay-screen.how-it-worked').fadeIn(200);
		  $('#wrap').css({
		    'overflow': 'hidden',
		    'height': '100%'
		  });
	    $("#loading").Loadingdotdotdot({
	        "word": "Your Celebrity Match is extracting your tweets or instagram images you posted to predict your personality"
	    });
	});

});

$('.celeb-img img').on('load', function() {
	$(this).parent().removeClass('shrinked');
	$(this).parent().addClass('expanded');
}).each(function() {
	if (this.complete) {
		$(this).load();
	}
});
