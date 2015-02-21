'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/flickr.html'
], function($, _, Backbone, FlickrTemplate) {

    var Flickr = Backbone.View.extend({


        render: function() {

            $(this.el).html(FlickrTemplate)

        }

    });

    return Flickr;

});
