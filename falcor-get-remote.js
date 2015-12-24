var falcor = require('./lib');
var Model = falcor.Model;
var cacheGenerator = require('./test/CacheGenerator');
var cache = cacheGenerator(0, 10);
var TriggerDataSource = require("./performance/TriggerDataSource");
var inMemoryCache = require('./performance/tests/inMemoryCache');
var triggerSource = new TriggerDataSource(inMemoryCache);
var ImmediateScheduler = require('./lib/schedulers/ImmediateScheduler');
var triggerModel = new Model({
    cache: {},
    source: triggerSource,
    scheduler: new ImmediateScheduler()
});
var head = require('./lib/internal/head');
var tail = require('./lib/internal/tail');
var next = require('./lib/internal/next');
var prev = require('./lib/internal/prev');
var noOp = function noOp() {};

function callFalcor() {
    for (var i = 0; i < 1000; ++i) {
        triggerModel.
            get(['lolomo', 0, {to:9}, 'item', 'title']).
            subscribe(noOp, noOp, function() {
                triggerModel._root.cache = {};
                triggerModel._root[head] = null;
                triggerModel._root[tail] = null;
                triggerModel._root[prev] = null;
                triggerModel._root[next] = null;
                triggerModel._root.expired = [];
            });
        triggerSource.trigger();
    }
    async();
}

function async() {
    console.log('async');
    setTimeout(function() {
        callFalcor();
    }, 0);
}

async();
