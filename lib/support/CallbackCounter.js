/**
 * A callback counter will call the provided callback once count is
 * at or below 0.
 *
 * @param {Function} cb -
 * @private
 */
var CallbackCounter = module.exports = function CallbackCounter(cb) {
    this._count = 0;
    this._cb = cb;
    this._dispose = false;
};

/**
 * adds another count to the counter.
 */
CallbackCounter.prototype.increment = function increment() {
    this._count++;
};

/**
 * disposes the callback counter.
 */
CallbackCounter.prototype.dispose = function dispose() {
    this._dispose = true;
};

/**
 * The function to be called from the other sources.
 */
CallbackCounter.prototype.callback = function callback() {
    if (this._dispose) {
        return;
    }

    --this._count;
    if (this._count === 0) {
        this._cb();
    }
};
