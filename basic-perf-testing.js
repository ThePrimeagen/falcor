var Benchmark = require('benchmark');

function testCode() {
    [0, 1, 2, 3, 4].reduce((acc, x) => acc + x, 0);
}

function log() {
    console.log.apply(console, arguments);
}

// Run the code
var suite = Benchmark.Suite('yeah!');

for (var i = 0; i < 3; i++) {
    suite.add('test ' + i, testCode);
}

suite.
    on('cycle', function (event) {
        log('result', event.target.hz);
    }).
    on('complete', function() {
        log('completed');

    }).
    run();
