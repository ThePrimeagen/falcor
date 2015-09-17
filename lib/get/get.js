var getCachePosition = require("./../get/getCachePosition");
var InvalidModelError = require("./../errors/InvalidModelError");
var BoundJSONGraphModelError = require("./../errors/BoundJSONGraphModelError");
var SHORTED = require('./SHORTED');

module.exports = function get(walk, isJSONG) {
    return function innerGet(model, paths, seed) {
        seed = seed[0];
        var results = {
            optimizedPaths: [],
            hasValue: false
        };

        // Sets the object on the seed.json
        if (!isJSONG && !seed.json) {
            seed.json = {};
        }

        var seedJSON = seed.json;

        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition = cache;
        var optimizedPath, optimizedLength = boundPath.length;
        var i, len;
        var requestedPath = [];

        // If the model is bound, then get that cache position.
        if (optimizedLength) {

            // JSONGraph output cannot ever be bound or else it will
            // throw an error.
            if (isJSONG) {
                return {
                    criticalError: new BoundJSONGraphModelError()
                };
            }
            currentCachePosition = getCachePosition(model, boundPath);

            // If there was a short, then we 'throw an error' to the outside
            // calling function which will onError the observer.
            if (currentCachePosition === SHORTED) {
                return {
                    criticalError: new InvalidModelError(boundPath, boundPath)
                };
            }

            // We need to get the new cache position and copy the bound
            // path.
            optimizedPath = [];
            for (i = 0; i < optimizedLength; ++i) {
                optimizedPath[i] = boundPath[i];
            }
        }

        // Update the optimized path if we
        else {
            optimizedPath = [];
            optimizedLength = 0;
        }

        var hasValue = false;
        for (i = 0, len = paths.length; i < len; i++) {
            hasValue = walk(model, cache, currentCachePosition, paths[i], 0,
                 seed, null, seedJSON, results, requestedPath, optimizedPath,
                 optimizedLength) || hasValue;
        }

        results.hasValue = hasValue;
        return results;
    };
};
