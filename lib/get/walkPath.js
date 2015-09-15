var followReference = require("./followReference");
var onValueType = require("./onValueType");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
module.exports = function walkPath(model, root, curr, path, depth, seed,
                                   currentSeed, outerResults, requestedPath,
                                   optimizedPathArg, optimizedLength,
                                   fromReferenceArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!curr || curr && curr.$type) || depth === path.length) {
        return onValueType(model, curr, path, depth, seed, currentSeed,
                           outerResults, requestedPath, optimizedPath,
                           optimizedLength, false, fromReference);
    }

    var keySet, i, len;
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
        return false;
    }

    // loop over every key over the keySet
    var optimizedLengthPlus1 = optimizedLength + 1;
    var hasValue = false;
    var notAtEndOfPath = nextDepth < path.length;
    var keyIndex = 0;
    var missingKeys;
    do {
        fromReference = false;

        var next;
        var nextSeed;

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

            // Creates the output for pathMap unless we are at the end of
            // the path.
            if (notAtEndOfPath) {
                nextSeed = currentSeed[key];
                if (!nextSeed) {
                    nextSeed = currentSeed[key] = {};
                }
            }

            // If we are at the end of the output we need to use depth - 1
            // requestedPath as key and create the output.
            else {
                nextSeed = currentSeed;
            }

            // If next is a reference follow it.  If we are in JSONG mode,
            // report that value into the seed without passing the requested
            // path.  If a requested path is passed to onValueType then it
            // will add that path to the JSONGraph envelope under `paths`
            if (notAtEndOfPath && nType &&
                nType === $ref && !isExpired(next)) {
                var ref = followReference(model, root, root, next,
                                          value, seed);
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

        // Recurse to the next level.
        var createdValue = walkPath(model, root, next, path, nextDepth, seed,
                            nextSeed, outerResults, requestedPath,
                            nextOptimizedPath, nextOptimizedLength,
                            fromReference);

        // Case 1: There is no value out of the recursion and we are the top
        // level (depth === 0) then we need to delete the key.
        // Case 2: hasValue === true and createdValue === false then we need
        // delete the key from the output.
        if ((!createdValue && (depth === 0 || hasValue))) {
            delete currentSeed[key];
        }

        // Case 3:  If we have 2 falses, both hasValue and createdValue, then
        // we need to keep track of the falses if in a keySets.  If the first
        // key has no value, but the second key has a value then we need to
        // retrospectively clean up the first key from the output.
        else if (!createdValue && !hasValue && isKeySet) {
            if (!missingKeys) {
                missingKeys = [];
            }

            missingKeys[keyIndex] = key;
        }

        // Case 4: We have false for hasValue and true for createdValue and our
        // keyIndex > 0, therefore we need to clean up the output.  This case is
        // partially caught from case 1, when depth === 0.  Deletes previous
        // keys
        else if (!hasValue && createdValue && keyIndex > 0) {
            for (i = 0, len = missingKeys.length; i < len; ++i) {
                delete currentSeed[missingKeys[i]];
            }
        }

        hasValue = createdValue || hasValue;

        // If the iteratorNote is not done, get the next key.
        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
            ++keyIndex;
        }

    } while (iteratorNote && !iteratorNote.done);

    return hasValue;
};
