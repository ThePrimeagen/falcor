var falcor = require('./lib');
var cacheGenerator = require('./test/CacheGenerator');
var cache = cacheGenerator(0, 10);
var model = new falcor.Model({
    cache: cache
});

function callFalcor() {
    for (var i = 0; i < 1000; ++i) {
        model.get(['lolomo', 0, {to:9}, 'item', 'title']).subscribe();
    }
    async();
}

function async() {
    setTimeout(function() {
        callFalcor();
    }, 0);
}

async();
