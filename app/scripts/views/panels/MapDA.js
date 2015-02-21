'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/mapDA.html'
], function($, _, Backbone, mapDATemplate) {

    var MapDA = Backbone.View.extend({

        render: function() {

            $(this.el).html(mapDATemplate);
        }

    });

    return MapDA;

});
