'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents'
], function($, _, Backbone, appEvents) {

    var AppRouter = Backbone.Router.extend({
        routes: {
            // TODO: Add routes
            // Default - catch all
            '*actions': 'defaultCatchAll'
        },

        initialize: function(appView) {
            this.otherViews = appView;
        },

        defaultCatchAll: function() {
        }
    });

    var initialize = function(options) {

        var appView = options.appView;
        var router = new AppRouter(appView);

        appEvents.on('changeRouteRequest', function(data) {
            router.navigate(data, {
                trigger: true
            });
        });

        appEvents.on('changeRouteRequestFalse', function(data) {
            router.navigate(data, {
                trigger: false
            });
        });
    };

    return {
        initialize: initialize
    };

});