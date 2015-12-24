function createClosure(closure) {
    return function innerAdd(mod) {
        return function innerMul(mul) {
            return function innerInner() {
                return ((closure ? closure() : 0) + mod) * mul;
            };
        };
    };
}

function SuperParentObject(mul) {
    this.mul = mul;
}

function ParentObject(mod, mul) {
    SuperParentObject.call(this, mul);
    this.mod = mod;
}

function CreateObject(otherObject, mod, mul) {
    ParentObject.call(this, mod, mul);
    this.obj = otherObject;
}

CreateObject.prototype = {
    run: function run() {
        return ((this.obj ? this.obj.run() : 0) + this.mod) * this.mul;
    }
};

function getObject() {
    var obj = null;
    for (var i = 0; i < 10; i++) {
        obj = new CreateObject(obj, 5, 2);
    }
    return obj;
}

function getClosure() {
    var closure = null;
    for (var i = 0; i < 10; i++) {
        closure = createClosure(closure)(5)(2);
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
        return closures();
    };
    var obj = function() {
        return objs.run();
    };

    var a = closure();
    var b = obj();
    console.log(a, b);

    for (var i = 0; i < 10; i++) {
        var isClosure = i % 2 === 0;
        suite.add(
            (isClosure ? 'closure ' : 'object ') + i,
            isClosure ? closure : obj);
    }
});
