var a = require('./perf-example');
var benchmarkRunner = require('./basic-perf-testing');

benchmarkRunner(function(suite) {
    suite.add('test(1)', a);
    suite.add('test(2)', a);
    suite.add('test(3)', a);
    suite.add('test(4)', a);
    suite.add('test(5)', a);
    suite.add('test(6)', a);
    suite.add('test(7)', a);
    suite.add('test(8)', a);
    suite.add('test(9)', a);
    suite.add('test(0)', a);
});
