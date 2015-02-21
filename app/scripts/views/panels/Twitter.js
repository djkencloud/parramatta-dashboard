'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/twitter.html'
], function($, _, Backbone, TwitterTemplate) {

    var Twitter = Backbone.View.extend({

        // https://twitter.com/settings/widgets/561658849359187968/edit

        render: function() {

            $(this.el).html(TwitterTemplate)

        }

    });

    return Twitter;

});
