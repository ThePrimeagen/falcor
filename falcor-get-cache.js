var falcor = require('./lib');
var cacheGenerator = require('./test/CacheGenerator');
var cache = cacheGenerator(0, 10);
var model = new falcor.Model({
    cache: cache
});

// THERE WE GO
model.get(['lolomo', 0, {to:9}, 'item', 'title']).subscribe();
