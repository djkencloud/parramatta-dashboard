'use strict';

define([
    'backbone',
    'models/SampleModel'
], function(Backbone, SampleModel) {

    var SampleCollection = Backbone.Collection.extend({

        model: SampleModel,

        initialize: function(){

        },

        successLoad: function() {
            console.log('success');
        },

        errorLoad: function(e) {
            console.log('error', e);
        },

        parse: function(response) {
            console.log('response ', response);
        }

    });

    return SampleCollection;
});
