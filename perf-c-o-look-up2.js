function createClosure(closure) {
    return function innerClosure(mod) {
        return function innerInner() {
            return (closure ? closure() : 0) + mod;
        };
    };
}

function ParentObject(mod) {
    this.mod = mod;
}

ParentObject.prototype = {
    run: function run() {
        return (this.obj ? this.obj.run() : 0) + this.mod;
    }
};

function CreateObject(otherObject, mod) {
    ParentObject.call(this, mod);
    this.obj = otherObject;
}

CreateObject.prototype = new ParentObject();

function getObject() {
    var obj = null;
    for (var i = 0; i < 10; i++) {
        obj = new CreateObject(obj, 5);
    }
    return obj;
}

function getClosure() {
    var closure = null;
    for (var i = 0; i < 10; i++) {
        closure = createClosure(closure)(5);
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
