var falcor = require('./lib');
var Model = falcor.Model;
var cacheGenerator = require('./test/CacheGenerator');
var Rx = require('rx');
var model = new Model({
    source: {
        get: function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: cacheGenerator(0, 10)
                });
                obs.onCompleted();
            });
        }
    }
});
var path;
path = ['lolomo', 0, {to:9}, 'item', 'title'];
describe('test', function() {
    it('test', function() {
        model.
            get(path).
            subscribe();
    });
});
