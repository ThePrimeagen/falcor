var lru = require("./util/lru");
var clone = require("./util/clone");
var promote = lru.promote;
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");
var $modelCreated = require("./../internal/model-created");

module.exports = function onValue(model, node, seed, currentSeed, depth,
                                  outerResults, requestedPath, optimizedPath,
                                  optimizedLength, isJSONGraph) {
    // Preload
    if (!seed) {
        return;
    }

    var i, len, k, key, curr, prev, prevK;
    var materialized = false, valueNode;

    if (node) {
        promote(model, node);
    }

    if (!node || node.value === undefined) {
        materialized = model._materialized;
    }

    // materialized
    if (materialized) {
        valueNode = {$type: $atom};
    }

    // Boxed Mode will clone the node.
    else if (model._boxed) {
        valueNode = clone(node);
    }

    // JSONG always clones the node.
    else if (node.$type === $ref || node.$type === $error) {
        if (isJSONGraph) {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else if (isJSONGraph) {
        var isObject = node.value && typeof node.value === "object";
        var isUserCreatedNode = !node[$modelCreated];
        if (isObject || isUserCreatedNode) {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else {
        valueNode = node.value;
    }

    if (isJSONGraph) {
        curr = seed.jsonGraph;
        if (!curr) {
            curr = seed.jsonGraph = {};
            seed.paths = [];
        }
        for (i = 0, len = optimizedLength - 1; i < len; i++) {
            key = optimizedPath[i];

            if (!curr[key]) {
                curr[key] = {};
            }
            curr = curr[key];
        }

        // assign the last
        key = optimizedPath[i];

        // TODO: Special case? do string comparisons make big difference?
        curr[key] = materialized ? {$type: $atom} : valueNode;
        if (requestedPath) {
            seed.paths.push(requestedPath.slice(0, depth));
        }
    }


    // Case 1: We are bound to a value, or the cache itself is a value.
    else if (depth === 0) {
        seed.json = valueNode;
    }

    // Case 2: We followed a reference to this value, therefore there is a null
    // at the end of the requested path and we must report the value at the
    // parent level.
    else if (requestedPath[depth] === null) {
        var current = seed.json;
        for (i = 0; i < depth - 1; ++i) {
            current = current[requestedPath[i]];
        }
        current[requestedPath[depth - 1]] = valueNode;
    }

    // Case 3: Simple case, we can just report the value.
    else {
        key = requestedPath[depth - 1];
        currentSeed[key] = valueNode;
    }
};
