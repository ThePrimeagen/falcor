var RequestTypes = require("./RequestTypes");
var GetRequest = require("./GetRequestV2");
var CallbackCounter = require('./../support/CallbackCounter');
var RequestQueueGetDisposable = require('./RequestQueueGetDisposable');

/**
 * The request queue is responsible for queuing the operations to
 * the model"s dataSource.
 *
 * @param {Model} model -
 * @param {Scheduler} scheduler -
 */
function RequestQueueV2(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

RequestQueueV2.prototype = {
    /**
     * Sets the scheduler, but will not affect any current requests.
     */
    setScheduler: function(scheduler) {
        this.scheduler = scheduler;
    },

    /**
     * Creates a get request to the dataSource.  Depending on the current
     * scheduler is how the getRequest will be flushed.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} cb -
     */
    get: function(requestedPaths, optimizedPaths, cb) {
        var self = this;
        var disposables = [];
        var requests = self._requests;
        var i, len;
        var oRemainingPaths = optimizedPaths;
        var rRemainingPaths = requestedPaths;
        var disposed = false;
        var request;
        var callbackCounter = new CallbackCounter(cb);

        for (i = 0, len = requests.length; i < len; ++i) {
            request = requests[i];
            if (request.type !== RequestTypes.GetRequest) {
                continue;
            }

            // The request has been sent, attempt to jump on the request
            // if possible.
            if (request.sent) {
                var results = request.add(
                    rRemainingPaths, oRemainingPaths, callbackCounter);

                // Checks to see if the results were successfully inserted
                // into the outgoing results.  Then our paths will be reduced
                // to the complement.
                if (results[0]) {
                    rRemainingPaths = results[1];
                    oRemainingPaths = results[2];
                    disposables[disposables.length] = results[3];
                    callbackCounter.increment();
                }
            }

            // If there is a non sent request, then we can batch and leave.
            else {
                request.batch(
                    rRemainingPaths, oRemainingPaths, callbackCounter);
                oRemainingPaths = [];
                rRemainingPaths = [];
                callbackCounter.increment();
            }

            // If there are no more remaining paths then exit the loop.
            if (!oRemainingPaths.length) {
                break;
            }
        }

        // After going through all the available requests if there are more
        // paths to process then a new request must be made.
        if (oRemainingPaths.length) {
            request = new GetRequest(self.scheduler, self);
            requests[requests.length] = request;
            callbackCounter.increment();
            var disposable = request.batch(
                rRemainingPaths, oRemainingPaths, callbackCounter);
            disposables[disposables.length] = disposable;
        }

        // When disposing the request all of the outbound requests will be
        // disposed of.
        return new RequestQueueGetDisposable(disposables, callbackCounter);
    },

    /**
     * Removes the request from the request
     */
    removeRequest: function(request) {
        var requests = this._requests;
        var i = requests.length;
        while (--i >= 0) {
            if (requests[i].id === request.id) {
                requests.splice(i, 1);
                break;
            }
        }
    }
};

module.exports = RequestQueueV2;
