'use strict';

define([
    'underscore',
    'backbone',
], function(_, Backbone) {

    var SampleModel = Backbone.Model.extend({

        defaults: {
            //"id": "",
        },

        initialize: function() {
            //this.id = this.get('id');
        }

    });

    return SampleModel;

});
