var followReference = require("./followReference");
var onValueType = require("./onValueType");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");

module.exports = function walkPath(model, root, currCachePosition, path, depth,
                                   seed, outerResults, requestedPath,
                                   optimizedPathArg, optimizedLengthArg,
                                   isJSONG, fromReferenceArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;
    var optimizedLength = optimizedLengthArg;
    var maxDepth = path.length;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!currCachePosition || currCachePosition && currCachePosition.$type) ||
        depth === maxDepth) {

        onValueType(model, currCachePosition, path, depth, seed, outerResults,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);
        return;
    }

    var recursed = false;

    // Iterate over the path until there is a complex key, at that point use
    // the iterate keyNote to call the next path on each of the keys from the
    // keySet, then continue no further.
    for (var depthCounter = depth;

         // We continue to iterate until there is no cache or our depthCounter
         // is equal to our maxDepth
         currCachePosition && !currCachePosition.$type &&
         depthCounter < maxDepth;

         // increment the depth counter.
         ++depthCounter) {

        var keySet, i;
        keySet = path[depthCounter];

        var isKeySet = typeof keySet === "object";
        var nextDepth = depthCounter + 1;
        var iteratorNote = false;
        var key = keySet;
        if (isKeySet) {
            iteratorNote = {};
            key = iterateKeySet(keySet, iteratorNote);
        }

        // The key can be undefined if there is an empty path.  An example of an
        // empty path is: [lolomo, [], summary]
        if (key === undefined && iteratorNote.done) {
            return;
        }

        // loop over every key over the keySet
        var optimizedLengthPlus1 = optimizedLength + 1;

        // Assumes that the key could be complex so we do a do ... while.
        // If the key is not complex then we will only perform the loop once
        // then exit.
        do {
            fromReference = false;

            var nextCachePosition;
            // The last key could be null to get the value after a reference.
            if (key === null) {
                nextCachePosition = currCachePosition;
            }

            else {
                nextCachePosition = currCachePosition[key];
                optimizedPath[optimizedLength] = key;
                requestedPath[depthCounter] = key;
            }

            var nextOptimizedPath = optimizedPath;
            var nextOptimizedLength = optimizedLengthPlus1;

            // If there is the next position we need to consider references.
            if (nextCachePosition) {
                var nType = nextCachePosition.$type;
                var value = nType &&
                    nextCachePosition.value || nextCachePosition;

                // If next is a reference follow it.  If we are in JSONG mode,
                // report that value into the seed without passing the requested
                // path.  If a requested path is passed to onValueType then it
                // will add that path to the JSONGraph envelope under `paths`
                if (nextDepth < path.length && nType &&
                    nType === $ref && !isExpired(nextCachePosition)) {
                    if (isJSONG) {
                        onValueType(model, nextCachePosition, path, nextDepth,
                                    seed, outerResults, null, optimizedPath,
                                    nextOptimizedLength, isJSONG,
                                    fromReference);
                    }
                    var ref = followReference(model, root, root,
                                              nextCachePosition, value, seed,
                                              isJSONG);
                    fromReference = true;
                    nextCachePosition = ref[0];
                    var refPath = ref[1];
                    nextOptimizedPath = [];
                    nextOptimizedLength = refPath.length;
                    for (i = 0; i < nextOptimizedLength; ++i) {
                        nextOptimizedPath[i] = refPath[i];
                    }
                }
            }

            // If there is not a next cache postion then we need to report
            // the value.  If this is not a keySet, then we need to leave the
            // loop.

            // If we are a keySet then we will recurse instead of continuing
            // to iterate through the keys.
            if (isKeySet) {
                walkPath(model, root, nextCachePosition, path, nextDepth, seed,
                         outerResults, requestedPath, nextOptimizedPath,
                         nextOptimizedLength, isJSONG, fromReference);
            }

            // We have to set all the variables to the next state of the loop,
            // as if we have recursed.
            else {
                optimizedLength = nextOptimizedLength;
                optimizedPath = nextOptimizedPath;
                currCachePosition = nextCachePosition;
            }

            // If the iteratorNote is not done, get the next key.
            if (iteratorNote && !iteratorNote.done) {
                key = iterateKeySet(keySet, iteratorNote);
            }

        } while (iteratorNote && !iteratorNote.done);

        // Continue no further since we are recursing at this point.
        if (isKeySet) {
            recursed = true;
            break;
        }
    }

    // Its the same report statement, just at the bottom, in case the pathSet
    // is filled with simple keySets. The only difference is that we report the
    // value when no recursion has taken place.
    if (!recursed &&
        (!currCachePosition || currCachePosition && currCachePosition.$type) ||
        depthCounter === maxDepth) {

        onValueType(model, currCachePosition, path, depthCounter, seed,
                    outerResults, requestedPath, optimizedPath, optimizedLength,
                    isJSONG, fromReference);
    }
};
