'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/memoryHeader.html'
], function($, _, Backbone, MemoryHeader) {

    var MemoryProject = Backbone.View.extend({


        render: function() {

            $('#memory-project-header').html(MemoryHeader);


            // should move out into a new template if we are using more than 2 videos
            $('#video-one').html('<div class="responsive-container"><iframe src="//player.vimeo.com/video/111322161" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')

            $('#video-two').html('<div class="responsive-container"><iframe src="//player.vimeo.com/video/111323333" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')


        }

    });

    return MemoryProject;

});
