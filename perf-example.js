function a() {
    var now = Date.now();
    while (Date.now() - now < 5) { }
}



var benchmarkRunner = require('./basic-perf-testing');
benchmarkRunner(function(suite) {
    a();
    suite.add('test A 1', a);
    suite.add('test A 2', a);
    suite.add('test A 3', a);
    suite.add('test A 4', a);
    suite.add('test A 5', a);
    suite.add('test A 6', a);
    suite.add('test A 7', a);
    suite.add('test A 8', a);
    suite.add('test A 9', a);
    suite.add('test A 0', a);
});
