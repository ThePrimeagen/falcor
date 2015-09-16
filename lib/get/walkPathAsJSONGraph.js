var followReference = require("./followReference");
var onValueType = require("./onValueType");
var onValue = require("./onValue");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");

module.exports = function walkPathAsJSONGraph(model, root, curr, path, depth,
                                              seed, parentSeed, currentSeed,
                                              outerResults, requestedPath,
                                              optimizedPathArg, optimizedLength,
                                              fromReferenceArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!curr || curr && curr.$type) || depth === path.length) {
        return onValueType(model, curr, path, depth, seed, null,
                           outerResults, requestedPath, optimizedPath,
                           optimizedLength, true, fromReference);
    }

    var keySet, i;
    keySet = path[depth];

    var isKeySet = typeof keySet === "object";
    var nextDepth = depth + 1;
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
    var hasValue = false;
    do {
        fromReference = false;

        var next;

        if (key === null) {
            next = curr;
        }
        else {
            next = curr[key];
            optimizedPath[optimizedLength] = key;
            requestedPath[depth] = key;
        }

        var nextOptimizedPath = optimizedPath;
        var nextOptimizedLength = optimizedLengthPlus1;

        // If there is the next position we need to consider references.
        if (next) {
            var nType = next.$type;
            var value = nType && next.value || next;

            // If next is a reference follow it.  If we are in JSONG mode,
            // report that value into the seed without passing the requested
            // path.  If a requested path is passed to onValueType then it
            // will add that path to the JSONGraph envelope under `paths`
            if (nextDepth < path.length && nType &&
                nType === $ref && !isExpired(next)) {
                onValue(model, next, seed, null, nextDepth,
                            // Do not report this path by providing a
                            // null requestedPath.
                           outerResults, null, optimizedPath,
                           nextOptimizedLength, true);

                var ref = followReference(model, root, root, next,
                                          value, seed, true);
                fromReference = true;
                next = ref[0];
                var refPath = ref[1];
                nextOptimizedPath = [];
                nextOptimizedLength = refPath.length;
                for (i = 0; i < nextOptimizedLength; ++i) {
                    nextOptimizedPath[i] = refPath[i];
                }
            }
        }

        // Recurse to the next level and stores if there has been a value found.
        hasValue = walkPathAsJSONGraph(model, root, next, path, nextDepth, seed,
                                       parentSeed, currentSeed, outerResults,
                                       requestedPath, nextOptimizedPath,
                                       nextOptimizedLength, fromReference) ||
                                           hasValue;

        // If the iteratorNote is not done, get the next key.
        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }

    } while (iteratorNote && !iteratorNote.done);

    return hasValue;
};

