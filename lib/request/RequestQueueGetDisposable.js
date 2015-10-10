var RequestQueueGetDisposable = function RequestQueueGetDisposable(disposables,
                                                           callbackCounter) {
    this._callbackCounter = callbackCounter;
    this._disposables = disposables;
    this._disposed = false;
};

module.exports = RequestQueueGetDisposable;

/**
 * Performs a get request dispose.
 */
RequestQueueGetDisposable.prototype.dispose = function dispose() {
    var callbackCounter = this._callbackCounter;
    if (this._disposed || callbackCounter._count === 0) {
        return;
    }

    this._disposed = true;
    var disposables = this._disposables;
    var length = disposables.length;
    for (var idx = 0; idx < length; ++idx) {
        disposables[idx]();
    }
    callbackCounter.dispose();
};

