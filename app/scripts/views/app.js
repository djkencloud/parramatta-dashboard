'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'text!templates/skeleton.html',
    'views/panels/Header',
    'views/panels/Temperature',
    'views/panels/Traffic',
    'views/panels/MapDA',
    'views/panels/MapTree',
    'views/panels/Instagram',
    'views/panels/Twitter',
    'views/panels/DwellingCharts',
    'views/panels/Flickr',
    'views/panels/WhereGame',
    'views/panels/Factoid',
    'views/panels/MapCuisine',
    'views/panels/Happening',
    'views/panels/ParraSquare',
    'views/panels/MemoryProject'
], function($, _, Backbone, appEvents, SkeletonTemplate, Header, Temperature, Traffic, MapDA, MapTree, Instagram, Twitter, DwellingCharts, Flickr, WhereGame, Factoid, MapCuisine, Happening, ParraSquare, MemoryProject) {

    var App = Backbone.View.extend({

        _header: null,
        _temperature: null,
        _traffic: null,
        _mapDA: null,
        _mapTree: null,
        _instagram: null,
        _twitter: null,
        _dwellings: null,
        _flickr: null,
        _whereGame: null,
        _fact1: null,
        _fact2: null,
        _mapCuisine: null,
        _happening: null,
        _parraSquare: null,
        _memoryProject: null,


        _myInterval: null,
        _timer: null,
        _maxCount: 5,
        _counter: 0,
        _executeInterval: 4000,

        render: function() {

            // resize
            var resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';

            // Add global resize event.  Can remove if not required.
            $(window).bind(resizeEvent, function() {
                appEvents.trigger('pageResize', [ document.body.offsetWidth, document.body.offsetHeight ] );
            });

            // listen to resize in here
            appEvents.on('pageResize', this.onPageResize, this);


            // render basic skeleton of page -
            // Skeleton Template contains divs that runs the grid system - twitter bootstrap.
            // Each module/section is connected to the grid
            // This should allow very easily manipulation of the html
            $(this.el).html(SkeletonTemplate);

            // below are all the little views that connect to the above skeleton.
            //


            // render header and intro text...
            this._header = new Header();
            this._header.render();

           // temperature widget
            this._temperature = new Temperature({
                el: '#temp-widget'
            });
            this._temperature.render();

            // traffic camera widget
            this._traffic = new Traffic({
                el: '#traffic-widget'
            });
            this._traffic.render();


            // map DA
            this._mapDA = new MapDA({
                el: '#map-da'
            });
            this._mapDA.render();

            // map Tree
            this._mapTree = new MapTree({
                el: '#map-tree'
            });
            this._mapTree.render();


            // instagram
            this._instagram = new Instagram({
                el: '#instagram-widget'
            });
            this._instagram.render();


            // twitter
            this._twitter = new Twitter({
                el: '#twitter-cont'
            });
            this._twitter.render();

            // dwellings
            this._dwellings = new DwellingCharts();
            this._dwellings.render();

            // where is this game
            this._whereGame = new WhereGame({
                el: '#where-game'
            });
            this._whereGame.render();

            // flickr feed
            this._flickr = new Flickr({
                el: '#flickr'
            });
            this._flickr.render();


            // factoid ONE
            var factOne = 'There are 8685 residents of Parramatta who work in Sydney inner city. 6039 of these travel to work by train. 1133 by car. There are 1142 residents of Sydney inner city who work in Parramatta.';
            this._fact1 = new Factoid({
                el: '#factoid-one'
            });
            this._fact1.render(factOne, 'light-blue');

            // factoid TWO
            var factTwo = 'There are plans for the tallest residential building in the state to be based in Parramatta? In 2013/14 174,000 patrons visited the Riverside theatre attending 1835 events.';
            this._fact2 = new Factoid({
                el: '#factoid-two'
            });
            this._fact2.render(factTwo, 'red');


            // map of cuisine
            this._mapCuisine = new MapCuisine({
                el: '#map-cuisine'
            });
            this._mapCuisine.render();


            // What is happening?
            this._happening = new Happening({
                el: '#happening'
            });
            this._happening.render();

            // Parramatta Square
            this._parraSquare = new ParraSquare({
                el: '#parra-square'
            });
            this._parraSquare.render();


            // Memeory Project
            this._memoryProject = new MemoryProject();
            this._memoryProject.render();



            // call page resize to straighten up the row borders - should put a listener on page load items for production release.  Or just do this, it seems to work.
            this._myInterval = setInterval(function(){

                this._counter++;
                if (this._counter === this._maxCount) {
                    clearInterval(this._myInterval);
                }
                this.onPageResize();

            }.bind(this), this._executeInterval);

            this.onPageResize();

            // call when all the base elements have been rendered - not using
            //this.appReady();
        },

        //
        onPageResize: function() {

            // fairly crude attempt to make all 'box outlines' have the same height...
            if ($(window).width() >= 768 ) {
                $('.row').each(function() {
                    var rowChildren = $(this).find('.matchHeight');
                    var maxHeight = 0;
                    for (var i = 0; i < rowChildren.length; i++) {
                        if ($(rowChildren[i]).height() > maxHeight)  {
                            maxHeight = $(rowChildren[i]).height();
                        }
                    }

                    rowChildren.find('.border-outline').css({height: maxHeight});

                });

            }

        },

        // leave in case they want some kind of router functionality later on
        appReady: function() {
            appEvents.trigger('ready');
        }

    });

    return App;

});
