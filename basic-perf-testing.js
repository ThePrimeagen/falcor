var Benchmark = require('benchmark');

function log() {
    console.log.apply(console, arguments);
}

module.exports = function test(cb) {
    // Run the code
    var suite = Benchmark.Suite('yeah!');

    cb(suite);

    suite.
        on('cycle', function (event) {
            log(event.target.name, event.target.hz);
        }).
        on('complete', function() {
            log('completed');

        }).
        run();
}
