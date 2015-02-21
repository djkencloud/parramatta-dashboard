'use strict';
define([
    'soundjs',
    'tweenMax',
    'easing'
], function() {

    /**
     * WhackSound object -- this acts as a wrapper for our soundJS instances and provides fade transition functionality
     * @param {string} id -- the name of the sound
     * @param {string} src -- the path to the sound
     * @constructor
     */
    var WhackSound = function(id, src) {
        createjs.EventDispatcher.initialize(this);

        // properties
        this.id = id;
        this.src = src;
        this.instance = createjs.Sound.createInstance(id);
        this._volume = 1;
        this._fadeCoefficient = 1;
        this._isPlaying = false;
        this._timeline = null;
        this._timer = null;

        Object.defineProperty(this, 'isPlaying', {
            get: function() {
                return this._isPlaying;
            }
        });

        /**
         * Sets the volume level for this sound if a volume value is passed as an argument,
         * otherwise it returns the current volume level for the sound
         * @param {number} volume (between 0 and 1)
         * @returns {number} volume (between 0 and 1)
         */
        this.volume = function(volume) {
            if (volume !== undefined) {
                if (volume < 0) {
                    volume = 0;
                } else if (volume > 1) {
                    volume = 1;
                }
                this._volume = volume;
                this.applyVolume();
            } else {
                return this._volume;
            }
        };

        /**
         * Sets the pan value for this sound if a pan value is passed as an argument,
         * otherwise it returns the current pan value for the sound
         * @param {number} pan (between -1 and 1)
         * @returns {number} pan (between -1 and 1)
         */
        this.pan = function(pan) {
            if (pan > 1) {
                pan = 1;
            } else if (pan < -1) {
                pan = -1;
            }
            if (pan) {
                this.instance.setPan(pan);
            } else {
                return this.instance.getPan();
            }
        };

        /**
         * Sets the mute value for this sound if a mute value is passed as an argument,
         * otherwise it returns the current mute value for the sound
         * @param {boolean} mute
         * @returns {boolean}
         */
        this.mute = function(mute) {
            if (mute !== undefined) {
                mute = mute === 1;
                this.instance.setMute(mute);
            } else {
                return this.instance.getMute();
            }
        };

        /**
         * Plays the current sound
         * @param {boolean} argument -- sets the sound to loop infinitely OR object, with properties loop, offset, and delay
         * @returns {*} itself so it can be chained
         */
        this.play = function(argument) {
            var loopValue = argument ? -1 : 0;
            var options = {interrupt: createjs.Sound.INTERRUPT_ANY, loop: loopValue};
            if (typeof argument === 'object') {
                argument.interrupt = createjs.Sound.INTERRUPT_ANY;
                this.instance.play(argument);
            } else {
                this.instance.play(options);
            }
            this._isPlaying = true;
            return this;
        };

        /**
         * Pauses the current sound
         * @returns {*} itself so it can be chained
         */
        this.pause = function() {
            this.instance.pause();
            this._isPlaying = false;
            return this;
        };

        /**
         * Resumes playing the current sound
         * @returns {*} itself so it can be chained
         */
        this.resume = function() {
            this.instance.resume();
            this._isPlaying = true;
            return this;
        };

        this.seek = function(seconds) {
            this.instance.setPosition(seconds * 1000);
        };

        /**
         * Stops playing the current sound and returns the playhead to the beginning of the sound
         * @returns {*} itself so it can be chained
         */
        this.stop = function() {
            try {
                this.instance.stop();
            } catch (e) {
            }
            this._isPlaying = false;
            return this;
        };

        /**
         * Fade the current sound in
         * @param {number} duration - in seconds
         * @returns {*} itself so it can be chained
         */
        this.fadeIn = function(duration) {
            this._fadeCoefficient = 0;
            this.fadeTransition(duration, false, 1);
            return this;
        };

        /**
         * Fade the current sound out
         * @param {number} duration (in seconds)
         * @returns {*} itself so it can be chained
         */
        this.fadeOut = function(duration) {
            this.fadeTransition(duration, true, 0);
            return this;
        };

        /**
         * Execute a fade
         * @param {number} duration (in seconds)
         * @param {function} stopOnComplete callback
         * @param {number} targetFadeCoefficient the value of this._fadeCoefficient at the end of the fade
         */
        this.fadeTransition = function(duration, stopOnComplete, targetFadeCoefficient) {
            if (this._timeline) {
                this._timeline.kill();
            }
            this._timeline = new TimelineMax({
                onUpdate: function() {
                    this.applyVolume();
                },
                onUpdateScope: this,
                onComplete: function(stopOnComplete) {
                    if (stopOnComplete) {
                        this.stop();
                    }
                },
                onCompleteParams: [stopOnComplete],
                onCompleteScope: this
            });
            this._timeline.insert(TweenMax.to(this, duration, {ease: Linear.easeNone, _fadeCoefficient: targetFadeCoefficient}));
            this.applyVolume();
        };

        this.applyVolume = function(volume) {
            this._volume = volume || this._volume;
            this.instance.setVolume(this._volume * this._fadeCoefficient);
        };

        this.activateTimer = function() {
            if (!this._timer) {
                this._timer = setInterval(function() {
                    var curtime = this.instance.getPosition() / 1000;
                    if (!isNaN(curtime) && this._isPlaying) {
                        this.dispatchEvent({type: 'timeUpdate', timeupdate: curtime}, this);
                    }
                }.bind(this), 100);
            }
        };

        this.cancelTimer = function() {
            if (this._timer) {
                clearInterval(this._timer);
                this._timer = null;
            }
        };

        this.onComplete = function() {
            this.stop();
        };

        this.dispose = function() {
            if (this._timeline) {
                this._timeline.kill();
            }
            this._timeline = null;
            this.stop();
            this.cancelTimer();
            this.instance.removeEventListener('complete', this.onComplete);
            createjs.Sound.removeSound(this.id);
            this.instance = null;
        };

        this.onComplete = this.onComplete.bind(this);
        this.instance.addEventListener('complete', this.onComplete);

    };

    /**
     * Determine if web audio is available
     */
    WhackSound.useWebAudio = (function() {
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

    return WhackSound;

});