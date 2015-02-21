'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/happening.html'
], function($, _, Backbone, HappeningTemplate) {

    var Happening = Backbone.View.extend({


        render: function() {

            $(this.el).html(HappeningTemplate);

        }

    });

    return Happening;

});
