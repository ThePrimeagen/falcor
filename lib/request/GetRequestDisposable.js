/**
 * Creates a disposable for the get request at this specific index.
 * @param {GetRequestV2} request -
 * @param {Number} idx -
 */
var GetRequestDisposable = module.exports = function GetRequestDisposable(
                                                request, idx) {
    this._idx = idx;
    this._disposed = false;
    this._request = request;
};

/**
 * Removes the callbacks, optimizedPaths, and requestPaths from the
 * current request.  If there are no more requests then remove this
 * requset from the queue.
 */
GetRequestDisposable.prototype.dispose = function dispose() {
    var idx = this._idx;
    var request = this._request;
    if (this._disposed || request._disposed) {
        return;
    }

    this._disposed = true;
    request._callbacks[idx] = null;
    request._optimizedPaths[idx] = [];
    request._requestedPaths[idx] = [];

    // If there are no more requests, then dispose all of the request.
    var count = --request._count;
    if (count === 0 && !request.sent) {
        request._disposable.dispose();
        request.requestQueue.removeRequest(request);
    }
};
