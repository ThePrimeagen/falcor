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

// I add this async loop because I see much better results with flame graph
// generation when there is some sort of break, instead of while(true){...}.
// this is with option node --perf-basic-prof-only-functions or
// --perf-basic-prof
function async() {
    setTimeout(function() {
        callFalcor();
    }, 0);
}

async();
