'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/mapCuisine.html'
], function($, _, Backbone, mapCuisineTemplate) {

    var MapCuisine = Backbone.View.extend({

        render: function() {

            $(this.el).html(mapCuisineTemplate);
        }

    });

    return MapCuisine;

});
