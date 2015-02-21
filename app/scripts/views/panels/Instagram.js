'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/instagram.html'
], function($, _, Backbone, InstagramTemplate) {

    var Instagram = Backbone.View.extend({

        // http://snapwidget.com/

        render: function() {

            $(this.el).html(InstagramTemplate)

        }

    });

    return Instagram;

});
