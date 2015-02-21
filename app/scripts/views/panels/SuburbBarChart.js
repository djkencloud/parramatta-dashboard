'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'text!templates/suburbBar.html'
], function($, _, Backbone, appEvents, SuburbBarTemplate) {

    var SuburbBarChart = Backbone.View.extend({

        _data: null,
        _suburbList: [],
        _currentData: null,
        _y: null,
        _x: null,
        _svg: null,
        _height: null,

        render: function(data) {

            console.log("data ", data )

            this._data = data;

            this.onPageResizeHandler = this.onPageResizeHandler.bind(this);
            this.onSuburbChange = this.onSuburbChange.bind(this);

            for (var i=0; i < this._data.length; i++) {
                if (this._data[i].Suburb != 'AllSuburbs') {
                    this._suburbList.push(this._data[i].Suburb)
                }
            }

            var data = {
                suburb: this._suburbList,
                _: _
            };

            var template = _.template(SuburbBarTemplate);
            var compiledTemplate = template(data);
            $('#suburb-bar').html(compiledTemplate);

            var that = this;
            $('#suburb-list').change(function(e) {
                e.preventDefault();
                var suburbId = $(this).val();
                that.onSuburbChange(suburbId);
            });

            this._currentData = this._data[0];
            this.drawChart(this._data[0]);

            appEvents.on('pageResize', this.onPageResizeHandler);



        },

        onPageResizeHandler: function(data) {
            this.drawChart(this._currentData);
        },

        drawChart: function(suburbData) {

            var that = this;

            $('#bar-2').empty();

            var totalWidth =  $('#bar-2').width();
            var totalHeight = totalWidth * 0.8;

            var margin = {top: 20, right: 20, bottom: 50, left: 40};
            var width = totalWidth - margin.left - margin.right;
            this._height = totalHeight - margin.top - margin.bottom;

            this._x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1)
                .domain(d3.keys(suburbData).filter(function(key) { return key !== 'ABS SSC Code' && key !== 'Suburb' && key !== 'Total' }));


            var total = this._x.domain().map(function(name) {
                return {
                    name: name,
                    value: +(suburbData[name])
                };
            });


            this._y = d3.scale.linear()
                .range([this._height, 0])
/*                .domain([0,d3.max(total, function(d) {
                    return +d.value;
                })])*/
                .domain([0,700])


            var xAxis = d3.svg.axis()
                .scale(this._x)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(this._y)
                .orient('left')
                .ticks(6);

            this._svg = d3.select('#bar-2').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', this._height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


            this._svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this._height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function() {
                    return "rotate(-65)"
                });

            this._svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)


            var bars = this._svg.selectAll(".bar")
                .data(total)
                .enter().append("g").attr("class", "bar");

            //create the rectangles.
            bars.append("rect")
                .attr('class', 'rect')
                .attr("x", function(d) { return that._x(d.name); })
                .attr("y", function(d) { return that._y(d.value); })
                .attr("width", this._x.rangeBand())
                .attr("height", function(d) { return that._height - that._y(d.value); });



            bars.append("text")
                .text(function(d){ return d.value })
                .attr('class', 'bar-label')
                .attr("x", function(d) { return  that._x(d.name) + that._x.rangeBand()/2; })
                .attr("y", function(d) { return that._y(d.value)-5; })
                .attr("text-anchor", "middle");


        },

        onSuburbChange: function(suburbId) {

            var that = this;

            var newSuburb = _.find(this._data, function(obj) {
                return obj.Suburb === suburbId;
            });

            this._currentData = newSuburb;

            var total = this._x.domain().map(function(name) {
                return {
                    name: name,
                    value: newSuburb[name]
                };
            });

            var bars = this._svg.selectAll(".bar").data(total);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return that._y(d.value); })
                .attr("height", function(d) { return that._height - that._y(d.value); })

            bars.select("text").transition().duration(500)
                .text(function(d){ return d.value })
                .attr("y", function(d) {return that._y(d.value)-5; });

            //console.log(newSuburb)

        }

    });

    return SuburbBarChart;

});
