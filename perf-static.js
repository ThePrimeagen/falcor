var promote = require('./lib/lru/promote');
var promote2 = require('./lib/lru/promote2');
var falcor = require('./lib');
var atom = falcor.Model.atom;
var objs = [
    atom(1),
    atom(2),
    atom(3),
    atom(4),
    atom(5),
    atom(6),
    atom(7),
    atom(8),
    atom(9),
    atom(0)
];
var root = {};
debugger
objs.forEach(function(obj) {
    promote2(root, obj);
});
debugger
objs.forEach(function(obj) {
    promote(root, obj);
});
debugger


function useP() {
    objs.forEach(function(obj) {
        promote(root, obj);
    });
}

function useP2(obj, obj2) {
    objs.forEach(function(obj) {
        promote2(root, obj);
    });
}

var benchmarkRunner = require('./basic-perf-testing');

benchmarkRunner(function(suite) {
    for (var i = 0; i < 10; i++) {
        var isKeys = i % 2 === 0;
        suite.add(
            (isKeys ? 'keys' : 'var ') + i,
            isKeys ? useP2: useP);
    }
});
