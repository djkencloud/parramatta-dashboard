'use strict';
define([
    'audio/WhackSound',
    'config',
    'jquery',
    'underscore',
    'soundjs'
], function(WhackSound, config, $, _) {

    var Whack = function() {
    };
    Whack.isLoadComplete = false;
    Whack.sfxCount = 0;
    Whack.sfxLoadedCount = 0;

    createjs.Sound.alternateExtensions = ['mp3', 'ogg'];
    createjs.EventDispatcher.initialize(Whack);

    Object.defineProperty(Whack, 'progress', {get: function() {
        if (Whack.sfxCount === 0) {
            return 1;
        } else if (!Whack.sfxCount) {
            return 0;
        }
        return Whack.sfxLoadedCount / Whack.sfxCount;
    }});

    Object.defineProperty(Whack, 'itemsLoaded', {get: function() {
        if (!Whack.sfxLoadedCount) {
            return 0;
        }
        return Whack.sfxLoadedCount;
    }});

    Object.defineProperty(Whack, 'totalItems', {get: function() {
        if (!Whack.sfxCount) {
            return 0;
        }
        return Whack.sfxCount;
    }});

    /**
     * Load a json manifest file
     * default path is: scripts/manifest.json
     * Sounds are divided into 2 categories: sound effects (sfx) and music
     * Sounds effects are preloaded by default, but music must manually be fetched using the fetch function
     * @param {string} [manifestPath] -- the path to the manifest file
     */
    Whack.loadManifest = function(manifestPath) {
        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
        manifestPath = manifestPath || 'data/audio-manifest.json';

        $.ajax({
            dataType: 'json',
            url: manifestPath,
            error: function() {
                console.error('Whack: error loading manifest. Is the path correct? Is the json well-formed?');
            },
            success: function(data) {
                Whack._manifest = data;

                // Use CDN assets?
                if (config.useCDNResources) {
                    _.each(Whack._manifest.sources, function(audioGroup) {
                        _.each(audioGroup, function(audioData) {
                            audioData.src = config.cdnResourcesBasePath + audioData.src;
                        });
                    });
                }

                Whack.sfxCount = (function() {
                    var counter = 0;
                    for (var sound in data.sources.sfx) {
                        if (sound) {
                            counter++;
                        }
                    }
                    return counter;
                })();

                Whack.sfxLoadedCount = 0;

                createjs.Sound.addEventListener('fileload', function(event) {
                    console.log(event);
                    // build our sound
                    Whack.sounds[event.id] = new WhackSound(event.id, event.src);

                    // execute callbacks
                    if (event.id in Whack.eventQueue) {
                        Whack.eventQueue[event.id].apply(Whack.sounds[event.id]);
                        delete Whack.eventQueue[event.id];
                    }

                    // only increment if the fileload is in response to a sfx - ie. if audio is streaming before the loading starts or whilst the loading is in progress
                    if (_.contains(_.pluck(data.sources.sfx, 'src'), event.src)) {
                        Whack.sfxLoadedCount++;
                        Whack.dispatchEvent({type: 'progress', id: event.id, src: event.src, sound: Whack.sounds[event.id]});
                    }

                    if (Whack.sfxLoadedCount === Whack.sfxCount) {
                        Whack.dispatchEvent({type: 'complete', sounds: Whack.sounds});
                    }
                });

                if (Whack.sfxCount === 0) {
                    Whack.dispatchEvent({type: 'complete'});
                }

                var processedManifest = [];

                for (var item in data.sources.sfx) {
                    processedManifest.push({id: item, src: (data.sources.sfx[item].src)});
                }

                createjs.Sound.registerManifest(processedManifest);
                Whack.dispatchEvent({type: 'manifestloaded', manifest: data});
            }
        });
    };

    /**
     * Object for storing sound instances
     * @type {{}}
     */
    Whack.sounds = {};

    /**
     * This is the event queue, it's used for storing callbacks that are to be executed once a sound has been loaded
     * @type {{}}
     */
    Whack.eventQueue = {};

    /**
     * Get an existing sound instance by ID
     * @param {string} id -- the id of the sound as defined in the manifest
     * @returns {Object} Sound object
     */
    Whack.get = function(id) {
        try {
            console.log(Whack.sounds);
            return Whack.sounds[id];
        } catch (e) {
            console.error('Whack: No sound instance exists for that ID');
            return false;
        }
    };

    /**
     * Fetch a sound (if necessary) by ID and create a sound instance
     * Use Whack function for music or atmos which is not preloaded
     * @param {string} id -- the ID of the sound file as defined in the manifest
     * @param {function} callback -- the functions to be executed once the sound instance is created
     * @returns {boolean} -- successful or not
     */
    Whack.fetch = function(id, callback) {
        var src = null;
        var foundID = false;

        // if the sound already exists, don't fetch it, execute the callback
        if (id in Whack.sounds) {
            if (callback) {
                callback.apply(Whack.get(id));
            }
            return true;
        }

        // if there is no manifest then log an error
        else if (typeof Whack._manifest === 'undefined') {
            console.error('Whack: The manifest is not defined');
            return false;
        }

        // find the sound in the manifest and then register it and execute the callback once it's loaded
        else {
            if (typeof Whack._manifest === 'undefined') {
                console.error('Whack: The manifest is not defined');
                return false;
            }

            for (var source in Whack._manifest.sources) {
                if (id in Whack._manifest.sources[source]) {
                    foundID = true;
                    src = Whack._manifest.sources[source][id].src;
                    break;
                }
            }

            if (src) {
                if (typeof callback === 'function') {
                    // we push the callback on the event queue so it will be executed once the file is loaded
                    Whack.eventQueue[id] = callback;
                }

                createjs.Sound.registerSound(src, id);
                return true;
            } else {
                if (!foundID) {
                    console.error('Whack: ID ' + id + ' could not be found');
                } else if (!src) {
                    console.error('Whack: No source can be found for ' + id);
                }
                return false;
            }
        }
    };

    Whack.fetchBySrc = function(src, id, callback) {
        if (id in Whack.sounds) {
            var sound = Whack.get(id);
            if (callback) {
                callback.apply(sound);
            }
            return sound;
        }

        if (typeof callback === 'function') {
            // we push the callback on the event queue so it will be executed once the file is loaded
            Whack.eventQueue[id] = callback;
        }

        createjs.Sound.registerSound(src, id);
    };

    Whack.removeSound = function(id) {
        Whack.sounds[id].dispose();
        Whack.sounds[id] = null;
        delete Whack.sounds[id];
    };

    /**
     * Sets the volume level for all sounds if a float is passed as an argument,
     * otherwise it returns the current volume level
     * @param {number} volume (optional. A value between 0 and 1)
     * @returns {*} itself
     */
    Whack.volume = function(volume) {
        if (volume !== undefined) {
            createjs.Sound.setVolume(volume);
        } else {
            return createjs.Sound.getVolume();
        }
    };

    /**
     * Set all sounds to mute if a mute value is passed as an argument,
     * otherwise it returns the current mute value
     * @param {boolean} mute
     * @returns {*}
     */
    Whack.mute = function(mute) {
        if (mute !== undefined) {
            mute = mute === true;
            createjs.Sound.setMute(mute);
        } else {
            return createjs.Sound.getMute();
        }
    };

    /**
     * Stops all playing sound instances
     * @returns {*} itself
     */
    Whack.stopAll = function() {
        createjs.Sound.stop();
        return Whack;
    };

    return Whack;
});