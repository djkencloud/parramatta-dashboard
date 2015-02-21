'use strict';

define([
    'jquery',
    'underscore',
    'appEvents',
    'easeljs',
    'tweenMax'
], function($, _, appEvents) {

    /**
     * MousePosition.js
     * Get information on the position of the mouse in relation to the target element
     * @constructor
     */
    var MousePosition = function() { };

    var p = MousePosition.prototype;

    createjs.EventDispatcher.initialize(p);

    p._$displayObject = null;
    p._identifier = null;
    p._posX = 0;
    p._posY = 0;
    p._mouseOverObject = true;
    p._mouseMove = false;
    p._targetWidth = 0;
    p._targetHeight = 0;
    p._resetMouseMove = null;

    /**
     * Initialization method.
     * @method initialize
     * @param {object} displayObject - The target object to inject the mouse event methods onto.
     * @param {string} identifier - A Unique Identifier
     */
    p.initialize = function(displayObject, identifier) {

        this._$displayObject = $(displayObject);
        this._identifier = identifier;

        this._posX = 0;
        this._posY = 0;
        this._mouseOverObject = true;
        this._mouseMove = false;
        this._coordinates = [];

        this._targetWidth = this._$displayObject.outerWidth(false);
        this._targetHeight = this._$displayObject.outerHeight(false);

        // bind functions
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.resetMouseMove = this.resetMouseMove.bind(this);

        if (this._$displayObject) {
            this.attachListeners();
        }
    };

    p.attachListeners = function() {

        this._$displayObject.bind('mouseenter', this.onMouseEnter);
        this._$displayObject.bind('mouseleave', this.onMouseLeave);
        this._$displayObject.bind('mousemove', this.onMouseMove);

        appEvents.on('PAGE_RESIZE', this.onPageResize, this);

    };

    p.onMouseEnter = function() {

        this._mouseOverObject = true;
        this.dispatch();
    };

    p.onMouseLeave = function() {

        this._mouseOverObject = false;
        this.dispatch();
    };

    p.onMouseMove = function(evt) {

        // check we actually have moved, mouse move event fires in chrome when mouse is stationary.
        if (this._posX !== evt.clientX || this._posY !== evt.clientY ) {
            this._posX = evt.clientX;
            this._posY = evt.clientY;
            this._mouseMove = true;
            this.dispatch();
        }

        // after mouse has moved, need to rese the mouseMove variable to false and dispatch to listner
        if (this._resetMouseMove) {
            window.clearTimeout(this._resetMouseMove);
        }

        this._resetMouseMove = window.setTimeout(this.resetMouseMove, 0.3);
    };

    p.resetMouseMove = function() {

        this._mouseMove = false;
        this.dispatch();
    };

    p.onPageResize = function() {

        this._targetWidth = this._$displayObject.outerWidth(false);
        this._targetHeight = this._$displayObject.outerHeight(false);

    };

    // dispatches a change in mouse position status
    p.dispatch = function() {

        var mousePositionData = {};

        mousePositionData.posRatioWidth = this._posX / this._targetWidth;
        mousePositionData.posRatioHeight = this._posY / this._targetHeight;
        mousePositionData.x = this._posX;
        mousePositionData.y = this._posY;
        mousePositionData.overDisplayObject = this._mouseOverObject;
        mousePositionData.mouseMove = this._mouseMove;

        this.dispatchEvent({type: 'mousePositionEvent', data: mousePositionData}, this);

    };

    p.detachListeners = function() {

        this._$displayObject.unbind('mouseenter', this.onMouseEnter);
        this._$displayObject.unbind('mouseleave', this.onMouseLeave);
        this._$displayObject.unbind('mousemove', this.onMouseMove);

        appEvents.off('PAGE_RESIZE', this.onPageResize);

    };

    p.dispose = function() {

        if (this._resetMouseMove) {
            clearTimeout(this._resetMouseMove);
        }

        this._coordinates = [];
        this.detachListeners();

        if (this._$displayObject) {
            this._$displayObject = null;
        }

    };

    return MousePosition;

});
