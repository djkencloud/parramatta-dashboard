'use strict';
define([], function() {

    var VideoPlayer = function() {
    };

    var p = VideoPlayer.prototype;
    createjs.EventDispatcher.initialize(p);

    p._renderTarget = null;
    p._video = null;
    p._container = null;
    p._width = 320;
    p._height = 240;
    p._timer = null;
    p._isPlaying = false;
    p._loop = false;
    p._firstPlay = true;
    p._id = null;
    p._title = null;

    Object.defineProperty(p, 'width', {
        get: function() {
            return this._width;
        },
        set: function(value) {
            this._width = value;
            this.layout();
        }
    });

    Object.defineProperty(p, 'height', {
        get: function() {
            return this._height;
        },
        set: function(value) {
            this._height = value;
            this.layout();
        }
    });

    Object.defineProperty(p, 'loop', {
        get: function() {
            return this._loop;
        },
        set: function(value) {
            this._loop = value;
            if (this._video) {
                this._video.loop = true;
            }
        }
    });

    Object.defineProperty(p, 'videoElement', {
        get: function() {
            return this._video;
        }
    });

    p.initialize = function(renderTarget, width, height, id, title) {
        if (renderTarget) {
            this._renderTarget = renderTarget;
            this._id = id;
            this._title = title;
            this._width = width || 320;
            this._height = height || 240;
            this._video = this.createVideoElement();
            this._container = this.createContainer();
            this._renderTarget.appendChild(this._container);
            this._container.appendChild(this._video);
            this.layout();
            this.onTimeUpdate = this.onTimeUpdate.bind(this);
            this.onError = this.onError.bind(this);
            this.onTimeUpdate = this.onTimeUpdate.bind(this);
            this.onPlay = this.onPlay.bind(this);
            this.onPauseEvent = this.onPauseEvent.bind(this);
            this.onCanPlay = this.onCanPlay.bind(this);
            this.onEnd = this.onEnd.bind(this);
            this.onSeek = this.onSeek.bind(this);
            this.onBuffering = this.onBuffering.bind(this);
            this.onBufferingComplete = this.onBufferingComplete.bind(this);
            this.addEventListeners();
        }
    };

    p.layout = function() {
        // TODO: remove hardcoded ratio - calculate after first frame of video is loaded!
        var ratio = 1920 / 1080;
        // size container
        this._container.style.width = this._width + 'px';
        this._container.style.height = this._height + 'px';
        if ((this._width / this._height) < ratio) {
            this._video.style.width = 'auto';
            this._video.style.height = '100%';
        } else {
            this._video.style.width = '100%';
            this._video.style.height = 'auto';
        }
    };

    p.createVideoElement = function() {
        var v = document.createElement('video');
        v.id = 'videoPlayer';
        v.setAttribute('crossorigin', 'anonymous');
        return v;
    };

    p.createContainer = function() {
        var c = document.createElement('div');
        c.style.overflow = 'hidden';
        c.style.display = 'block';
        c.style.position = 'relative';
        return c;
    };

    p.addSource = function(path, mimeType) {
        this.addSourceToVideoElement(this._video, path, mimeType);
    };

    p.addSourceToVideoElement = function(videoElement, path, mimeType) {
        var source = document.createElement('source');
        source.src = path;
        source.type = mimeType;
        videoElement.appendChild(source);
    };

    p.sendPlayBeacon = function() {
        /* jshint ignore:start */
        var tracker = window['sbs_tracker'];
        tracker && tracker.event('videoplay', this._id, this._title);
        /* jshint ignore:end */
    };

    p.sendFinishBeacon = function() {
        /* jshint ignore:start */
        var tracker = window['sbs_tracker'];
        tracker && tracker.event('videofinished', this._id, this._title);
        /* jshint ignore:end */
    };

    p.play = function() {
        this._video.play();
        if (this._firstPlay) {
            this.sendPlayBeacon();
            this._firstPlay = false;
        }
    };

    p.onCanPlay = function() {
        this.layout();
    };

    p.pause = function() {
        if (!this._video.paused) {
            this._video.pause();
        }
    };

    p.seek = function(seconds) {
        this._video.currentTime = seconds;
    };

    p.addEventListeners = function() {
        this._video.addEventListener('loadedmetadata', this.onMetadata);
        this._video.addEventListener('error', this.onError);
        this._video.addEventListener('timeupdate', this.onTimeUpdate);
        this._video.addEventListener('play', this.onPlay);
        this._video.addEventListener('pause', this.onPauseEvent);
        this._video.addEventListener('canplay', this.onCanPlay);
        this._video.addEventListener('ended', this.onEnd);
        this._video.addEventListener('seeking', this.onSeek);
        this._video.addEventListener('loadstart', this.onBuffering);
        this._video.addEventListener('waiting', this.onBuffering);
        this._video.addEventListener('playing', this.onBufferingComplete);
        this._video.addEventListener('canplay', this.onBufferingComplete);
        this._video.addEventListener('loadeddata', this.onBufferingComplete);
        this.activateTimer();
    };

    p.onMetadata = function() {
        this.onCanPlay();
        this.dispatchEvent({type: 'duration', duration: this._video.duration}, this);
    };

    p.currentTime = function() {
        return this._video.currentTime;
    };

    p.getDuration = function() {
        return this._video.duration;
    };

    p.onError = function(evt) {
        if ('error' in evt.target && !evt.target.error) {
            switch (evt.target.error.code) {
                case evt.target.error.MEDIA_ERR_ABORTED:
                    console.warn('You aborted the video playback.');
                    break;
                case evt.target.error.MEDIA_ERR_NETWORK:
                    console.warn('A network error caused the video download to fail part-way.');
                    break;
                case evt.target.error.MEDIA_ERR_DECODE:
                    console.warn('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                    break;
                case evt.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    console.warn('The video could not be loaded, either because the server or network failed or because the format is not supported.');
                    break;
                default:
                    console.warn('An unknown error occurred.');
                    break;
            }
            this.dispatchEvent({type: 'playbackError'}, this);
        }
    };

    p.onTimeUpdate = function() {

    };

    p.onPlay = function() {
        this._isPlaying = true;
        this.dispatchEvent({type: 'play'}, this);
    };

    p.onPauseEvent = function() {
        this._isPlaying = false;
        this.dispatchEvent({type: 'pause'}, this);
    };

    p.onCanPlay = function() {
        this.dispatchEvent({type: 'canPlay'}, this);
    };

    p.onBuffering = function() {
        this.dispatchEvent('buffering', this);
    };

    p.onBufferingComplete = function() {
        this.dispatchEvent('bufferingComplete', this);
    };

    p.onEnd = function() {
        this._isPlaying = false;
        this.sendFinishBeacon();
        this.dispatchEvent({type: 'end'}, this);
    };

    p.onSeek = function(evt) {
        var target = evt.srcElement || evt.currentTarget;  // webkit/ie vs firefox
        this.dispatchEvent({type: 'seek', currentTime: target.currentTime}, this);
    };

    // Addressing the fact that browsers handle the native time update event differently.
    p.activateTimer = function() {
        this._timer = setInterval(function() {
            var currentTime = this.currentTime();
            if (!isNaN(currentTime) && this._isPlaying) {
                this.dispatchEvent({type: 'timeUpdate', currentTime: currentTime}, this);
            }
        }.bind(this), 100);
    };

    p.cancelTimer = function() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    };

    p.removeEventListeners = function() {
        if (this._video) {
            this._video.removeEventListener('loadedmetadata', this.onCanPlay);
            this._video.removeEventListener('error', this.onError);
            this._video.removeEventListener('timeupdate', this.onTimeUpdate);
            this._video.removeEventListener('play', this.onPlay);
            this._video.removeEventListener('pause', this.onPauseEvent);
            this._video.removeEventListener('canplay', this.onCanPlay);
            this._video.removeEventListener('ended', this.onEnd);
            this._video.removeEventListener('seeking', this.onSeek);
            this._video.removeEventListener('loadstart', this.onBuffering);
            this._video.removeEventListener('waiting', this.onBuffering);
            this._video.removeEventListener('playing', this.onBufferingComplete);
            this._video.removeEventListener('canplay', this.onBufferingComplete);
            this._video.removeEventListener('loadeddata', this.onBufferingComplete);
        }
        this.cancelTimer();
    };

    p.dispose = function() {
        var sources;
        this.removeEventListeners();
        try {
            sources = this._video.querySelectorAll('source');
            for (var i = 0; i < sources.length; i++) {
                var source = sources[i];
                source.setAttribute('src', '');
            }
            this._video.load();
        } catch (e) {
            console.log(e);
        }
        this._renderTarget.removeChild(this._container);
        this._container.removeChild(this._video);
        this._video = null;
        this._container = null;
        this._renderTarget = null;
    };

    return VideoPlayer;

});