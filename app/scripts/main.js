'use strict';

require.config({

    baseUrl: 'scripts',

    paths: {

        // Major libraries via Bower
        jquery: '../../bower_components/jquery/dist/jquery',
        underscore: '../../bower_components/underscore/underscore',
        backbone: '../../bower_components/backbone/backbone',
        //easeljs: '../../bower_components/easeljs/lib/easeljs-NEXT.min',
        //preloadjs: '../../bower_components/PreloadJS/lib/preloadjs-NEXT.min',
        modernizr: '../../bower_components/modernizr/modernizr',
        //snapsvg: '../../bower_components/snapsvg/snap.svg',
        //soundjs: '../../bower_components/createjs-soundjs/lib/soundjs-NEXT.combined',
        moment: '../../bower_components/momentjs/moment',
        d3: '../../bower_components/d3/d3',

        // Require.js plugins
        text: '../../bower_components/requirejs-text/text',

        // Major vendor libraries outside Bower, eg. our licensed GSAP libraries
        tweenMax: 'vendor/greensock/src/uncompressed/TweenMax',
        timelineMax: 'vendor/greensock/src/uncompressed/TimelineMax',
        easing: 'vendor/greensock/src/uncompressed/easing/EasePack',
        //iframeResize: 'vendor/iframe-resize/iframeResizer.contentWindow.min',
        mapbox: 'vendor/mapbox/mapbox',

        // Shortcuts
        appEvents: 'events/appEvents',

        // Just a short cut to put our html outside the js dir
        templates: '../templates'

    },


    // Extra Shimmy Shimmy
    shim: {
        'mapbox': {
            exports: 'L'
        },
        'modernizr': {
            exports: 'Modernizr'
        },
        'tweenMax' : {
            exports: 'TweenMax'
        },
        'topojson' : {
            exports: 'topojson'
        }
    },

    config: {
        moment: {
            noGlobal: true
        }
    }

});

require(
    [
        'jquery',
        'underscore',
        'views/app',
        'router',
        'appEvents'
    ], function($, _, App, Router, appEvents) {
        var _app;

        // probably not using any router functionality - leave in just in case
        appEvents.on('ready', function() {
            appEvents.off('ready');
            Router.initialize({app: _app});
        });

        // render the application
        _app = new App({el: '#main-container'});
        _app.render();

    }
);
