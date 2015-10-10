var sinon = require('sinon');
var CallbackCounter = require('./../lib/support/CallbackCounter');
module.exports = function zipSpy(count, cb, maxTime) {
    var done = false;
    if (maxTime) {
        setTimeout(function() {
            for (var i = 0; i < counter._count; ++i) {
                counter.callback();
            }
            done = true;
        }, maxTime);
    }

    var spy = sinon.spy(cb);
    var counter = new CallbackCounter(spy);
    for (var i = 0; i < count; i++) {
        counter.increment();
    }
    counter.spy = spy;
    return counter;
};
