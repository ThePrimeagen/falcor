var pathUtils = require("falcor-path-utils");
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;

/**
 *
 * @param {GetRequestV2} request -
 * @param {Array} requestedPaths -
 * @param {Array} optimizedPaths -
 * @param {Array.<CallbackCounter>} callbacks -
 * @private
 */
var GetSourceRequest = module.exports = function GetSourceRequest(request,
                                                            requestedPaths,
                                                            optimizedPaths,
                                                            callbacks) {
    this._request = request;
    this._requestedPaths = requestedPaths;
    this._optimizedPaths = optimizedPaths;
    this._callbacks = callbacks;
};

/**
 * Flushes the current set of requests.  This will send the paths to the
 * dataSource.  * The results of the dataSource will be sent to callback which
 * should perform the zip of all callbacks.
 */
GetSourceRequest.prototype.flush = function flush() {
    var request = this._request;
    var optimizedPaths = this._optimizedPaths;

    if (request._count === 0) {
        request.requestQueue.removeRequest(request);
        return;
    }

    request.sent = true;
    request.scheduled = false;

    // TODO: Move this to the collapse algorithm,
    // TODO: we should have a collapse that returns the paths and
    // TODO: the trees.

    // Take all the paths and add them to the pathMap by length.
    // Since its a list of paths
    var pathMap = request._pathMap;
    var listKeys = Object.keys(optimizedPaths);
    var listIdx = 0, listLen = listKeys.length;
    for (; listIdx < listLen; ++listIdx) {
        var paths = optimizedPaths[listIdx];
        for (var j = 0, pathLen = paths.length; j < pathLen; ++j) {
            var pathSet = paths[j];
            var len = pathSet.length;

            if (!pathMap[len]) {
                pathMap[len] = [pathSet];
            } else {
                var pathSetsByLength = pathMap[len];
                pathSetsByLength[pathSetsByLength.length] = pathSet;
            }
        }
    }

    // now that we have them all by length, convert each to a tree.
    var pathMapKeys = Object.keys(pathMap);
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
        var pathMapKey = pathMapKeys[pathMapIdx];
        pathMap[pathMapKey] = toTree(pathMap[pathMapKey]);
    }

    // Take the pathMapTree and create the collapsed paths and send those
    // off to the server.
    var collapsedPaths = request._collasped = toPaths(pathMap);
    var jsonGraphData;

    // Make the request.
    // You are probably wondering why this is not cancellable.  If a request
    // goes out, and all the requests are removed, the request should not be
    // cancelled.  The reasoning is that another request could come in, after
    // all callbacks have been removed and be deduped.  Might as well keep this
    // around until it comes back.  If at that point there are no requests then
    // we cancel at the callback above.
    var self = this;
    request.
        requestQueue.
        model._source.
        get(collapsedPaths).
        subscribe(function(data) {
            jsonGraphData = data;
        }, function(err) {
            self.complete(err, jsonGraphData);
        }, function() {
            self.complete(null, jsonGraphData);
        });
};

/**
 * When the source request completes then this function is called
 * to inform the callbacks of the data and errors.
 */
GetSourceRequest.prototype.complete = function completed(err, data) {
    var request = this._request;
    var callbacks = this._callbacks;
    request.requestQueue.removeRequest(request);
    request._disposed = true;

    // If there is at least one callback remaining, then
    // callback the callbacks.
    if (request._count) {
        request._merge(this._requestedPaths, err, data);

        // Call the callbacks.  The first one inserts all the
        // data so that the rest do not have consider if their
        // data is present or not.
        for (var i = 0, len = callbacks.length; i < len; ++i) {
            var cCounter = callbacks[i];
            if (cCounter) {
                cCounter.callback(err, data);
            }
        }
    }
};


