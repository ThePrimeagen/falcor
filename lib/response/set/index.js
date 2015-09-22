var SetResponse = require("./SetResponse");
/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSON>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 * @private marked as private so it doesn't show up 2x.
 */
module.exports = function set() {
    var out = validateInput(arguments, SET_VALID_INPUT, "set");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return SetResponse.create(this, args);
};
