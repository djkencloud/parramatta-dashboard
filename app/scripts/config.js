'use strict';
define([
], function() {

    var config = {};

    // This is true for all browsers we support, but in Boilerplate is set to false so you can roll out a simple site
    // that doesn't pull its data from the CDN.
    var isCORSOnDataAvailable = false;

    // Is CORS for media assets supported in this environment? If yes, then our assets should be pulled from the CDN, not
    // site relative. Implement these rules how you see fit using Modernizr, browser sniffing, etc. For example, neither
    // IE10/11 nor Safari 7 support 'dirtying' cross domain video and sound.
    var isCORSOnMediaAvailable = false;

    // Generally this should not be implemented directly, rather use one of the base paths below
    config.cdnBasePath = '';

    // Our data assets
    config.dataBasePath = 'data/';

    // Our media assets
    config.videoBasePath = 'video/';
    config.imagesBasePath = 'images/';
    config.audioBasePath = 'audio/';

    if (isCORSOnDataAvailable) {
        config.dataBasePath = config.cdnBasePath + config.dataBasePath;
    }

    if (isCORSOnMediaAvailable) {
        config.videoBasePath = config.cdnBasePath + config.videoBasePath;
        config.imagesBasePath = config.cdnBasePath + config.imagesBasePath;
        config.audioBasePath = config.cdnBasePath + config.audioBasePath;
    }

    return config;

});
