'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/introText.html',
    'text!templates/header.html'
], function($, _, Backbone, IntroTextTemplate, HeaderTemplate) {

    var Header = Backbone.View.extend({


        render: function() {

            $('header').html(HeaderTemplate);
            $('#intro-text').html(IntroTextTemplate)

        }

    });

    return Header;

});
