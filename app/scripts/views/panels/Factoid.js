'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/factoid.html'
], function($, _, Backbone, FactTemplate) {

    var Factoid = Backbone.View.extend({


        render: function(fact, classColour) {

            var data = {
                fact: fact,
                classColour: classColour,
                _: _
            };

            var template = _.template(FactTemplate);
            var compiledTemplate = template(data);
            $(this.el).html(compiledTemplate);

        }

    });

    return Factoid;

});
