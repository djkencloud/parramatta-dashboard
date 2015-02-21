'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'text!templates/temperature.html',
    'moment'
], function($, _, Backbone, appEvents, TemperatureTemplate, moment) {

    var Temperature = Backbone.View.extend({

        // api key - f76b3fb2bb53c65d1e61634e3ca6f616
        // http://openweathermap.org/

        _dataDaily: null,
        _dataForecast: null,

        _dailyLoad: 0,
        _forecastLoad: 0,

        render: function() {

            this.onDailyData = this.onDailyData.bind(this);
            this.onForecastData = this.onForecastData.bind(this);

            var url = '//api.openweathermap.org/data/2.5/weather?id=7281840&APPID=f76b3fb2bb53c65d1e61634e3ca6f616&units=metric';
            var url2 = '//api.openweathermap.org/data/2.5/forecast/daily?id=7281840&APPID=f76b3fb2bb53c65d1e61634e3ca6f616&units=metric';


/*            $.get(url, function( data ) {
                this._data = data;
                this.onWeatherData();
            }.bind(this));*/

            $.get(url, this.onDailyData);
            $.get(url2, this.onForecastData);

        },

        onDailyData: function(data) {
            this._dataDaily = data;
            this._dailyLoad = 1;
            this.onWeatherData();
        },

        onForecastData: function(data) {
            this._dataForecast = data;
            this._forecastLoad = 1;
            this.onWeatherData();
        },


        onWeatherData: function() {

            if (this._forecastLoad === 1 && this._dailyLoad === 1) {

                //console.log('this._dataDaily ', this._dataDaily);
                //console.log('this._dataForecast ', this._dataForecast);

                var forecastArray = [];
                for (var i = 0; i < this._dataForecast.list.length; i++) {
                    forecastArray.push({
                        date: moment.utc(this._dataForecast.list[i].dt * 1000).format('ddd Do'),
                        temp: Math.round(this._dataForecast.list[i].temp.max),
                        icon: this._dataForecast.list[i].weather[0].icon
                    })
                };


                var data = {
                    daily: this._dataDaily,
                    currentTemp: Math.round( this._dataDaily.main.temp * 10) / 10,
                    sunrise: moment(this._dataDaily.sys.sunrise * 1000).format('HH:mm'),
                    sunset: moment(this._dataDaily.sys.sunset * 1000).format('HH:mm'),
                    direction: this.degToCompass(this._dataDaily.wind.deg),
                    forecast: forecastArray,
                    moment: moment,
                    _: _
                };

                var template = _.template(TemperatureTemplate);
                var compiledTemplate = template(data);
                $(this.el).html(compiledTemplate);
            }



        },

        // convert from kelvins to celcius (not needed can get metric)
        kelvinToC: function(num) {
            var newNum = num - 273.15;
            return Math.round(newNum);
        },

        degToCompass: function(num) {
            var val = parseInt((num/22.5)+0.5);
            var windArray = ['North','North Northeast','Northeast','East Northeast','East','East Southeast', 'Southeast', 'South Southeast','South','South Southwest','Southwest','West Southwest','West','West Northwest','Northwest','North Northwest'];
            return windArray[(val % 16)]
        }


    });

    return Temperature;

});
