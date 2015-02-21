'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/whereGame.html'
], function($, _, Backbone, GameTemplate) {

    var WhereGame = Backbone.View.extend({


        render: function() {

            $(this.el).html(GameTemplate)

        }

    });

    return WhereGame;

});
