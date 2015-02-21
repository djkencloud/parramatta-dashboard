'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'd3',
    'views/panels/SuburbBarChart',
    'views/panels/TotalBarChart',
    'text!templates/barHeader.html'
], function($, _, Backbone, appEvents, d3, SuburbBarChart, TotalBarChart, BarHeader) {

    var DwellingCharts = Backbone.View.extend({

        _data: null,

        render: function() {

            this.onDwellingData = this.onDwellingData.bind(this);

            $('#bar-header').html(BarHeader)

            d3.csv('data/dwellingCompletions.csv', this.onDwellingData)

        },

        onDwellingData: function(data) {

            this._data = data;

            var suburbBar = new SuburbBarChart();
            suburbBar.render(data);

            var totalBar = new TotalBarChart();
            totalBar.render(data);
        }

    });

    return DwellingCharts;

});
