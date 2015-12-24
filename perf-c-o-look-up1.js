function createClosure(closure) {
    return function innerClosure(mod) {
        return (closure ? closure() : 0) + 1;
    };
}

function CreateObject(otherObject) {
    this.obj = otherObject;
}

CreateObject.prototype = {
    run: function run() {
        return (this.obj ? this.obj.run() : 0) + 1;
    }
};

function getObject() {
    var obj = null;
    for (var i = 0; i < 10; i++) {
        obj = new CreateObject(obj);
    }
    return obj;
}

function getClosure() {
    var closure = null;
    for (var i = 0; i < 10; i++) {
        closure = createClosure(closure);
    }
    return closure;
}

function test(isClosure, runner) {
    return isClosure ? runner() : runner.run();
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
