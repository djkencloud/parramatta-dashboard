'use strict';
define([
    'soundjs',
    'tweenMax',
    'easing'
], function() {

    /**
     * @constructor
     * ThumpAudioInstance object -- this acts as a wrapper for soundJS instances and provides loading and audio transforms
     * @constructor
     */
    var ThumpAudioInstance = function() {
        this.onFileLoad = this.onFileLoad.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onFailed = this.onFailed.bind(this);
        this.onSucceeded = this.onSucceeded.bind(this);
    };

    /**
     * Determine if web audio is available
     */
    ThumpAudioInstance.useWebAudio = (function() {
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            new window.AudioContext();
            return true;
        }
        catch (e) {
            return false;
        }
    })();

    var p = ThumpAudioInstance.prototype;
    createjs.EventDispatcher.initialize(p);

    Object.defineProperty(p, 'isPlaying', {
        get: function() {
            return this._isPlaying;
        }
    });

    Object.defineProperty(p, 'isLoaded', {
        get: function() {
            try {
                return createjs.Sound.loadComplete(this.id);
            } catch(error) {
                return false;
            }
        }
    });

    Object.defineProperty(p, 'mute', {
        get: function() {
            return this._mute;
        },
        set: function(value) {
            this._mute = value;
            this.applyTransform();
        }
    });

    Object.defineProperty(p, 'volume', {
        get: function() {
            return this._volume;
        },
        set: function(value) {
            if (value) {
                if (value < 0) {
                    value = 0;
                } else if (value > 1) {
                    value = 1;
                }
                this._volume = value;
                this.applyTransform();
            }
        }
    });

    Object.defineProperty(p, 'pan', {
        get: function() {
            return this._pan;
        },
        set: function(value) {
            if (value > 1) {
                value = 1;
            } else if (value < -1) {
                value = -1;
            }
            this._pan = value;
            this.applyTransform();
        }
    });

    Object.defineProperty(p, 'position', {
        get: function() {
            if (this.instance) {
                return this.instance.getPosition();
            }
            return 0;
        }
    });

    Object.defineProperty(p, 'duration', {
        get: function() {
            if (this.instance) {
                return this.instance.getDuration();
            }
            return 0;
        }
    });

    /**
     * @param {string} type
     * @param {string} id -- the name of the sound
     * @param {string} src -- the path to the sound
     * @param {boolean} preload
     */
    p.init = function(type, id, src, preload) {
        this.id = id;
        this.src = src;
        this.type = type;
        this.preload = preload;
        this.instance = null;
        this._mute = false;
        this._volume = 1;
        this._pan = 0;
        this._fadeCoefficient = 1;
        this._isPlaying = false;
        this._timeline = null;
        this._timer = null;
        this._playOnLoaded = false;
        this._applyWhenSucceededQueue = [];
        if (preload) {
            this.load();
        }
        return this;
    };

    p.load = function() {
        createjs.EventDispatcher.initialize(this);
        createjs.Sound.registerSound(this.src, this.id);
        createjs.Sound.addEventListener('fileload', this.onFileLoad, null, true);
    };

    p.onFileLoad = function(event) {
        // create instance dispatch if it was our sound id that generated the event
        if (event.id === this.id && this.isLoaded) {
            this.instance = createjs.Sound.createInstance(this.id);
            this.instance.addEventListener('complete', this.onComplete);
            this.instance.addEventListener('failed', this.onFailed);
            this.dispatchEvent({type: 'loaded'});
            if (this._playOnLoaded) {
                this.play();
            }
        }
    };

    p.applyWhenSucceeded = function(func, parameters) {
        if (!parameters) {
            parameters = [];
        }
        this._applyWhenSucceededQueue.push({func: func, parameters: parameters});
        this.load();
    };

    p.executeApplyWhenSucceededQueue = function() {
        var applyQueueItem;
        while (this._applyWhenSucceededQueue.length) {
            applyQueueItem = this._applyWhenSucceededQueue.shift();
            console.log(applyQueueItem, this.isLoaded);
            applyQueueItem.func.apply(this, applyQueueItem.parameters);
        }
    };

    p.onFailed = function(event) {
        console.log(event);
    };

    /**
     * Plays the current sound
     * @param {*} argument -- sets the sound to loop infinitely OR object, with properties loop, offset, and delay
     * @returns {*} itself so it can be chained
     */
    p.play = function(argument) {
        if (!this.isLoaded) {
            this._playOnLoaded = true;
        } else {
            this.instance.addEventListener('succeeded', this.onSucceeded);
            var loopValue = argument ? -1 : 0;
            var options = {interrupt: createjs.Sound.INTERRUPT_ANY, loop: loopValue};
            if (typeof argument === 'object') {
                argument.interrupt = createjs.Sound.INTERRUPT_ANY;
                this.instance.play(argument);
            } else {
                this.instance.play(options);
            }

            this._isPlaying = true;
        }
        return this;
    };

    p.onSucceeded = function() {
        this.applyTransform();
        this.executeApplyWhenSucceededQueue();
    };

    /**
     * Pauses the current sound
     * @returns {*} itself so it can be chained
     */
    p.pause = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.pause);
        } else {
            this.instance.pause();
            this._isPlaying = false;
        }
        return this;
    };

    /**
     * Resumes playing the current sound
     * @returns {*} itself so it can be chained
     */
    p.resume = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.resume);
        } else {
            this.instance.resume();
            this._isPlaying = true;
        }
        return this;
    };

    /**
     * Jumps to the playhead position
     * @param {number} milliseconds
     * @return {*} itself so it can be chained
     */
    p.seek = function(milliseconds) {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.seek, [milliseconds]);
        } else {
            this.instance.setPosition(milliseconds);
        }
        return this;
    };

    /**
     * Stops playing the current sound and returns the playhead to the beginning of the sound
     * @returns {*} itself so it can be chained
     */
    p.stop = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.stop);
        } else {
            try {
                this.instance.stop();
            } catch (e) {
            }
            this._isPlaying = false;
        }
        return this;
    };

    /**
     * Fade the current sound in
     * @param {number} duration - in seconds
     * @returns {*} itself so it can be chained
     */
    p.fadeIn = function(duration) {
        duration = duration || 5;
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.fadeIn, [duration]);
        } else {
            this._fadeCoefficient = 0;
            this.fadeTransition(duration, false, 1);
        }
        return this;
    };

    /**
     * Fade the current sound out
     * @param {number} duration (in seconds)
     * @returns {*} itself so it can be chained
     */
    p.fadeOut = function(duration) {
        duration = duration || 5;
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.fadeOut, [duration]);
        } else {
            this.fadeTransition(duration, true, 0);
        }
        return this;
    };

    /**
     * Execute a fade
     * @private
     * @param {number} duration (in seconds)
     * @param {function} stopOnComplete callback
     * @param {number} targetFadeCoefficient the value of this._fadeCoefficient at the end of the fade
     */
    p.fadeTransition = function(duration, stopOnComplete, targetFadeCoefficient) {
        var timelineParams;

        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.fadeTransition, [duration, stopOnComplete, targetFadeCoefficient]);
        } else {
            if (this._timeline) {
                this._timeline.kill();
            }
            timelineParams = {
                onUpdate: function() {
                    this.applyTransform();
                },
                onUpdateScope: this,
                onComplete: function(stopOnComplete) {
                    if (stopOnComplete) {
                        this.stop();
                    }
                },
                onCompleteParams: [stopOnComplete],
                onCompleteScope: this
            };
            this._timeline = new TimelineMax(timelineParams);
            this._timeline.insert(TweenMax.to(this, duration, {ease: Linear.easeNone, _fadeCoefficient: targetFadeCoefficient}));
            this.applyTransform();
        }
    };

    /**
     * @private
     */
    p.applyTransform = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.applyTransform);
        } else {
            this.instance.setMute(this._mute);
            this.instance.setVolume(this._volume * this._fadeCoefficient);
            this.instance.setPan(this._pan);
        }
    };

    p.activateTimer = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.activateTimer);
        } else {
            if (!this._timer) {
                this._timer = setInterval(function() {
                    if (this._isPlaying) {
                        this.dispatchEvent({type: 'positionUpdate', position: this.position, duration: this.duration});
                    }
                }.bind(this), 100);
            }
        }
    };

    p.cancelTimer = function() {
        if (!this.isLoaded) {
            this.applyWhenSucceeded(this.cancelTimer);
        } else {
            if (this._timer) {
                clearInterval(this._timer);
                this._timer = null;
            }
        }
    };

    /**
     * @private
     */
    p.onComplete = function() {
        this.stop();
    };

    p.dispose = function() {
        createjs.Sound.removeEventListener('fileload', this.onFileLoad);
        if (this._timeline) {
            this._timeline.kill();
        }
        this._timeline = null;
        this.cancelTimer();
        if (this.instance) {
            this.stop();
            this.instance.removeEventListener('complete', this.onComplete);
            this.instance.removeEventListener('failed', this.onFailed);
            this.instance.removeEventListener('succeeded', this.onSucceeded);
        }
        createjs.Sound.remove(this.id);
        this.instance = null;
    };

    p.toString = function() {
        return 'ThumpAudioInstance: ' + this.id;
    };

    return ThumpAudioInstance;

});