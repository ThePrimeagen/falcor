var testMerge = require('./testMerge');
var getCore = require('./get/get.core.perf');
var getFull = require('./get/get.perf');
var set = require('./set/set.json-graph.perf');
var clone = require('./clone/clone.perf');

var standardTest = [getFull, 5];

module.exports = function(name) {
    // Creates the test suites
    var suite = require('./testSuite')(name);

    // merges tests
    for (var i = 0; i < standardTest.length; i += 2) {
        var test = standardTest[i];
        var count = standardTest[i + 1];
        test(suite.tests, count);
    }

    return suite;
};
