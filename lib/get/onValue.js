var lru = require("./util/lru");
var clone = require("./util/clone");
var promote = lru.promote;
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");
var $modelCreated = require("./../internal/model-created");

module.exports = function onValue(model, node, seed, currentSeed, depth,
                                  outerResults, requestedPath, optimizedPath,
                                  optimizedLength) {
    // Preload
    if (!seed) {
        return;
    }

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
        valueNode = node.value;
    }

    else {
        valueNode = node.value;
    }

    var key = requestedPath[depth - 1];
    currentSeed[key] = valueNode;
};
