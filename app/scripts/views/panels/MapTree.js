'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/mapTree.html'
], function($, _, Backbone, mapTreeTemplate) {

    var MapTree = Backbone.View.extend({

        render: function() {

            $(this.el).html(mapTreeTemplate);


        }

    });

    return MapTree;

});
