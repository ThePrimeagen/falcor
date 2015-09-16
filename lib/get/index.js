var get = require("./get");
var walkPath = require("./walkPath");
var walkPathAsJSONGraph = require("./walkPathAsJSONGraph");

var getWithPathsAsPathMap = get(walkPath, false);
var getWithPathsAsJSONGraph = get(walkPathAsJSONGraph, true);

module.exports = {
    getValueSync: require("./../get/getValueSync"),
    getBoundValue: require("./../get/getBoundValue"),
    getWithPathsAsPathMap: getWithPathsAsPathMap,
    getWithPathsAsJSONGraph: getWithPathsAsJSONGraph
};
