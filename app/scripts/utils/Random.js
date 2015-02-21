'use strict';
define([
], function() {

    var Random = function() {
        throw 'Pls don\'t <3';
    };

    Random.canvasCache = [];

    Random.fromArray = function(array) {
        return array[Math.floor(array.length * Math.random())];
    };

    Random.between = function(lower, upper, round) {
        var range = upper - lower;
        var rnd = Math.random() * range;
        var result = lower + rnd;
        if (round) {
            result = Math.round(result);
        }
        return result;
    };

    Random.fromSeed = function(seed) {
        var rnd;
        seed = (seed * 9301 + 49297) % 233280;
        rnd = seed / 233280;
        return rnd;
    };

    Random.generateSeedFromString = function(someString) {
        someString = someString.toString(); // don't try to trick me loose typing
        var seed = 0;
        for (var i = 0; i < someString.length; i++) {
            seed += someString.charCodeAt(i);
        }
        return seed;
    };

    Random.pixel = function(canvas, color) {
        var canvasContext;
        var imgData;
        var pixelsOfColor;
        var width;
        var r;
        var g;
        var b;
        var a;
        var l;
        var x;
        var y;
        var pixel;
        var i;

        // check to see if we have already extracted the pixels of a color for this canvas reference
        for (i = 0; i < Random.canvasCache.length; i++) {
            var cachedItem = Random.canvasCache[i];
            if (canvas === cachedItem.canvas &&
                color.r === cachedItem.color.r &&
                color.g === cachedItem.color.g &&
                color.b === cachedItem.color.b &&
                color.a === cachedItem.color.a) {
                pixelsOfColor = cachedItem.pixelsOfColor;
            }
        }

        // if not cached, extract pixels of a given color from the canvas
        if (pixelsOfColor.length === 0) {
            canvasContext = canvas.getContext('2d');
            imgData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
            pixelsOfColor = [];
            width = canvas.width;
            for (i = 0; i < imgData.data.length; i += 4) {
                r = imgData.data[i + 0];
                g = imgData.data[i + 1];
                b = imgData.data[i + 2];
                a = imgData.data[i + 3];
                l = i / 4;
                if (r === color.r && g === color.g && b === color.b && a === color.a) {
                    y = l / width;
                    x = l % width;
                    pixel = {x: x, y: y, r: color.r, g: color.g, b: color.b, a: color.a};
                    pixelsOfColor.push(pixel);
                }
            }

            // cache for next time
            Random.canvasCache.push({canvas: canvas, color: color, pixelsOfColor: pixelsOfColor});
        }

        if (pixelsOfColor.length) {
            return Random.fromArray(pixelsOfColor);
        }
        return null;
    };

    Random.shuffle = function(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    };

    return Random;

});