'use strict';
define(['common/config', 'preloadjs'], function(config) {

    var Resources = function() {
        throw 'Only static methods to be found here.';
    };
    createjs.EventDispatcher.initialize(Resources);

    Resources.SPRITE_SHEET_BASE = 'images/sprite-sheets/';
    Resources.callback = null;
    Resources.loader = null;
    Resources.manifest = null;
    Resources._itemsLoaded = 0;
    Resources._totalItems = 0;

    Object.defineProperty(Resources, 'progress', {get: function() {
        if (Resources._totalItems === 0) {
            return 0;
        } else {
            return Resources._totalItems === Resources._itemsLoaded;
        }
    }});

    Object.defineProperty(Resources, 'itemsLoaded', {get: function() {
        return Resources._itemsLoaded;
    }});

    Object.defineProperty(Resources, 'totalItems', {get: function() {
        return Resources._totalItems;
    }});

    Resources.load = function() {
        Resources.loader = new createjs.LoadQueue(true, null, config.useCDNResources ? true : null);
        Resources.loader.setMaxConnections(6); // default is 1... crazy!
        Resources.loader.addEventListener('fileload', Resources.onFileLoad.bind(Resources));
        Resources.loader.addEventListener('complete', Resources.onLoadComplete.bind(Resources));
        Resources.loader.addEventListener('error', Resources.onLoadError.bind(Resources));
        Resources.loader.loadManifest(Resources.manifest, true);
    };

    Resources.onLoadError = function() {

    };

    Resources.onFileLoad = function(e) {
        var item = e.item;
        var type = item.type;
        var images;
        var imageURL;
        var json;
        var i;

        // If this is a sprite sheet JSON, grab the images and:
        // 1. Append a base path
        // 2. Add images back to the preload queue so that when the spritesheet is instantiated, the images are cached and ready to display
        if (type === createjs.LoadQueue.JSON) {
            json = Resources.loader.getResult(item.id);
            // Are you a sprite sheet?
            if (json.animations && json.images && json.images.length) {
                images = json.images;
                for (i = 0; i < images.length; i++) {
                    // Why resolve the URL to absolute? The problem is this: we want to preload the URL from Resources,
                    // requiring one relative URL, then later, when the SpriteSheet is fired up from the JSON file, a
                    // completey different URL relative to the JSON file... Resolving to absolute and inserting,
                    // back into the JSON fixes this problem and allows for caching
                    imageURL = '';
                    if (config.useCDNResources) {
                        imageURL = Resources.qualifyURL(config.cdnResourcesBasePath + Resources.SPRITE_SHEET_BASE + images[i]);
                    } else {
                        imageURL = Resources.qualifyURL(Resources.SPRITE_SHEET_BASE + images[i]);
                    }
                    // preload
                    Resources._totalItems++;
                    Resources.loader.loadFile({id: imageURL, src: imageURL});
                    // modify JSON with new absolute URL
                    json.images[i] = imageURL;
                }
            }
        }
        Resources._itemsLoaded++;
        this.dispatchEvent('fileload', Resources);
    };

    Resources.onLoadComplete = function() {
        this.dispatchEvent('complete', Resources);
    };

    Resources.add = function(resourceId, resourceSrc) {
        if (!Resources.manifest) {
            Resources.manifest = [];
        }
        if (config.useCDNResources) {
            resourceSrc = config.cdnResourcesBasePath + resourceSrc;
        }
        Resources.manifest.push({
            id: resourceId,
            src: resourceSrc
        });
        Resources._totalItems++;
    };

    Resources.get = function(resourceId) {
        var result;
        if (!Resources.loader.loaded) {
            throw 'Loading not complete.';
        }
        result = Resources.loader.getResult(resourceId);
        if (!result) {
            throw 'Resource ' + resourceId + ' not found.';
        }
        return result;
    };

    Resources.getAsSpriteSheet = function(spriteSheetId) {
        var data = Resources.get(spriteSheetId);
        var imageURLs;
        var images;
        if (data.images.length && data.images[0] instanceof HTMLImageElement) {
            // URLS have already been converted to Image objects
            console.log('already an image object');
        } else {
            imageURLs = data.images.slice(0);
            images = [];
            for (var i = 0; i < imageURLs.length; i++) {
                images.push(Resources.get(imageURLs[i]));
            }
            data.images = images;
        }
        return new createjs.SpriteSheet(data);
    };

    // Dunno if this is a good approach, but it's the only method I could find
    // that works without knowing the base path prior... would be great
    // to replace with a non-DOM solution
    // http://james.padolsey.com/javascript/getting-a-fully-qualified-url/
    Resources.qualifyURL = function(url) {
        var img = document.createElement('img');
        img.src = url; // set string url
        url = img.src; // get qualified url
        img.src = null; // no server request
        return url;
    };

    return Resources;

});