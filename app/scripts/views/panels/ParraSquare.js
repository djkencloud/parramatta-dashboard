'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/parraSquare.html'
], function($, _, Backbone, ParraSquareTemplate) {

    var ParraSquare = Backbone.View.extend({


        render: function() {

            $(this.el).html(ParraSquareTemplate);

        }

    });

    return ParraSquare;

});
