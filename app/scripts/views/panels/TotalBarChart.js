'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'text!templates/lagBar.html'
], function($, _, Backbone, appEvents, LAGBar) {

    var TotalBarChart = Backbone.View.extend({

        _data: null,

        render: function(data) {

            this._data = data;

            $('#lag-bar').html(LAGBar);

            this.onPageResizeHandler = this.onPageResizeHandler.bind(this);

            this.drawChart();

            appEvents.on('pageResize', this.onPageResizeHandler);

        },


        onPageResizeHandler: function(data) {
            this.drawChart();
        },

        drawChart: function() {

            var that = this;

            $('#bar-1').empty();

            var totalWidth =  $('#bar-1').width();
            var totalHeight = totalWidth * 0.8;

            var margin = {top: 20, right: 20, bottom: 50, left: 40};
            var width = totalWidth - margin.left - margin.right;
            var height = totalHeight - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1)
                .domain(d3.keys(this._data[0]).filter(function(key) { return key !== 'ABS SSC Code' && key !== 'Suburb' && key !== 'Total' }));


            var total = x.domain().map(function(name) {
                return {
                    name: name,
                    value: that._data[that._data.length-1][name]
                };
            });


            var y = d3.scale.linear()
                .range([height, 0])
                .domain([0,3000])

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .ticks(6);

            var svg = d3.select('#bar-1').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function() {
                    return "rotate(-65)"
                });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Dwelling Completions");

            // don't forget to group !
            var bars = svg.selectAll(".bar")
                .data(total)
                .enter().append("g").attr("class", "bar");

            //create the rectangles.
            bars.append("rect")
                .attr('class', 'rect')
                .attr("x", function(d) { return x(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.rangeBand())
                .attr("height", function(d) { return height - y(d.value); });



            bars.append("text")
                .text(function(d){ return d.value })
                .attr('class', 'bar-label')
                .attr("x", function(d) { return  x(d.name) + x.rangeBand()/2; })
                .attr("y", function(d) { return  y(d.value)-5; })
                .attr("text-anchor", "middle");



        }

    });

    return TotalBarChart;

});
