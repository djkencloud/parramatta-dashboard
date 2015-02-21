'use strict';
define([
    'audio/ThumpAudioInstance',
    'config',
    'jquery',
    'underscore',
    'soundjs'
], function(ThumpAudioInstance, config, $, _) {

    var Thump = function() {
    };

    createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
    createjs.Sound.alternateExtensions = ['mp3', 'ogg'];
    createjs.EventDispatcher.initialize(Thump);

    /**
     * All ThumbAudioInstance objects
     * @type {{}}
     */
    Thump.audioInstanceLookup = {};

    /**
     * Is preloading complete?
     * @type {boolean}
     */
    Thump.isPreloadComplete = false;

    /**
     * The total of instances that require preloading
     * @type {number}
     */
    Thump.preloadInstanceCount = 0;

    /**
     * The count of currently loaded instances
     * @type {number}
     */
    Thump.preloadInstanceLoadedCount = 0;

    /**
     * Percent of loading complete
     */
    Object.defineProperty(Thump, 'progress', {
        get: function() {
            if (Thump.preloadInstanceCount === 0) {
                return 1;
            } else if (!Thump.preloadInstanceCount) {
                return 0;
            }
            return Thump.preloadInstanceLoadedCount / Thump.preloadInstanceCount;
        }
    });

    Object.defineProperty(Thump, 'volume', {
        get: function() {
            return createjs.Sound.getVolume();
        },
        set: function(value) {
            createjs.Sound.setVolume(value);
        }
    });

    Object.defineProperty(Thump, 'mute', {
        get: function() {
            return createjs.Sound.getMute();
        },
        set: function(value) {
            createjs.Sound.setMute(value);
        }
    });

    /**
     * Init and load a json manifest file, triggering the preload
     * default path is: data/audio-manifest.json
     * Sounds are divided into 2 categories: sound effects (sfx) and music
     * Sounds effects are preloaded by default
     * @param {string} [manifestPath] -- the path to the manifest file
     */
    Thump.init = function(manifestPath) {

        manifestPath = manifestPath || 'data/audio-manifest.json';

        $.ajax({
            dataType: 'json',
            url: manifestPath,
            error: function() {
                console.error('Thump: error loading manifest. Is the path correct? Is the json well-formed?');
            },
            success: function(data) {
                var manifestItemId;
                var manifestItem;
                var audioInstance;

                Thump._manifest = data;

                // prefix the audio assets with the base path
                _.each(Thump._manifest.sources, function(audioGroup) {
                    _.each(audioGroup, function(audioData) {
                        audioData.src = config.audioBasePath + audioData.src;
                    });
                });

                // sfx - instances for preloading
                for (manifestItemId in data.sources.sfx) {
                    manifestItem = {id: manifestItemId, src: (data.sources.sfx[manifestItemId].src)};
                    audioInstance = new ThumpAudioInstance().init('sfx', manifestItemId, manifestItem.src, true);
                    audioInstance.addEventListener('loaded', Thump.onPreloadInstanceLoaded);
                    Thump.preloadInstanceCount++;
                    Thump.audioInstanceLookup[manifestItemId] = audioInstance;
                }

                // music - instances for streaming
                for (manifestItemId in data.sources.music) {
                    manifestItem = {id: manifestItemId, src: (data.sources.music[manifestItemId].src)};
                    audioInstance = new ThumpAudioInstance().init('music', manifestItemId, manifestItem.src, false);
                    Thump.audioInstanceLookup[manifestItemId] = audioInstance;
                }

                Thump.dispatchEvent({type: 'initComplete', manifest: data});
            }
        });
    };

    Thump.onPreloadInstanceLoaded = function(event) {
        var audioInstance = event.target;
        if (event.target.preload) {
            Thump.preloadInstanceLoadedCount++;
            Thump.dispatchEvent({type: 'preloadProgress', id: event.id, src: event.src, instance: audioInstance});
            if (Thump.preloadInstanceLoadedCount >=  Thump.preloadInstanceCount) {
                Thump.dispatchEvent({type: 'preloadComplete'});
            }
        }
    };

    /**
     * Get an existing sound instance by ID
     * @param {string} id -- the id of the sound as defined in the manifest
     * @returns {Object} Sound object
     */
    Thump.get = function(id) {
        try {
            return Thump.audioInstanceLookup[id];
        } catch (e) {
            console.error('Whack: No sound instance exists for that ID');
            return false;
        }
    };

    Thump.remove = function(id) {
        var audioInstance = Thump.audioInstanceLookup[id];
        audioInstance.dispose();
        audioInstance = null;
        delete Thump.audioInstanceLookup[id];
    };

    /**
     * Stops all playing sound instances
     * @returns {*} itself
     */
    Thump.stopAll = function() {
        createjs.Sound.stop();
        return Thump;
    };

    return Thump;
});