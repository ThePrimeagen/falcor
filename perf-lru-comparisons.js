var Model = require('./lib').Model;
var atom = Model.atom;
var root = {};
var objs = [];

var rootNew = {};
var objsNew = [];

for (var i = 0; i < 10; ++i) {
    objs.push(atom(i));
    objsNew.push(atom(i));
}

var benchmarkRunner = require('./basic-perf-testing');

benchmarkRunner(function(suite) {
    var closures =  getClosure();
    var objs =  getObject();

    var closure = function() {
        closures();
    };
    var obj = function() {
        objs.run();
    };

    closure();
    obj();

    for (var i = 0; i < 10; i++) {
        var isClosure = i % 2 === 0;
        suite.add(
            (isClosure ? 'closure ' : 'object ') + i,
            isClosure ? closure : obj);
    }
});
