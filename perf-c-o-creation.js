function createClosure(closure) {
    return function innerClosure() {
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


function testObject() {
    var obj = null;
    for (var i = 0; i < 10; i++) {
        obj = new CreateObject(obj);
    }
    return obj;
}

function testClosure() {
    var closure = null;
    for (var i = 0; i < 10; i++) {
        closure = createClosure(closure);
    }
    return closure;
}


var benchmarkRunner = require('./basic-perf-testing');

benchmarkRunner(function(suite) {
    for (var i = 0; i < 10; i++) {
        var isClosure = i % 2 === 0;
        suite.add(
            (isClosure ? 'closure ' : 'object ') + i,
            isClosure ? testClosure : testObject);
    }
});
