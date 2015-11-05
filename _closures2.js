var ID = 0;

function closureWork(nextWork, seed) {
    seed = seed || 0;
    var myId = ++ID;
    var disp = ['a', 'b', 'c', 'd'];
    return function innerWork() {
        var nextSeed = seed + 1;
        var otherStuff = '';
        if (nextWork) {
            nextSeed += nextWork();
        }

        for (var i = 0; i < disp.length; ++i) {
            otherStuff += disp[i];
        }

        if (otherStuff === 'abcd') {
            seed = nextSeed + myId;
        }
        return seed;
    };
}

function closureWork2(nextWork, seed) {
    seed = seed || 0;
    var myId = ++ID;
    var disp = ['a', 'b', 'c', 'd'];
    return (function innerWork() {
        var nextSeed;

        return (function _2() {
            var otherStuff;

            // References several levels of closures
            return function _3() {
                nextSeed = seed + 1;
                otherStuff = '';

                if (nextWork) {
                    nextSeed += nextWork();
                }

                for (var i = 0; i < disp.length; ++i) {
                    otherStuff += disp[i];
                }

                if (otherStuff === 'abcd') {
                    seed = nextSeed + myId;
                }
                return seed;
            };
        }());
    }());
}


for (var r = 0; r < 10; ++r) {
    var start, stop, value;
    start = process.hrtime();

    // ---------- closures
    // ---------- creation
    var seed = 0;
    for (var i = 0; i < 2000000; ++i) {
        var superWork = closureWork(null, seed);
        for (var workCount = 1, workTotal = 20; workCount < workTotal; workCount++) {
            superWork = closureWork(superWork);
        }
    }
    stop = process.hrtime();
    publishResults('single', start, stop);

    // ---------- Execution
    start = process.hrtime();

    for (var i = 0; i < 2000000; ++i) {
        superWork();
    }
    stop = process.hrtime();
    publishResults('single-execution', start, stop);
    // ---------- objects
    // ---------- creation
    start = process.hrtime();

    seed = 0;
    for (i = 0; i < 2000000; ++i) {
        debugger
        var superWork = closureWork2(null, seed);
        for (var workCount = 1, workTotal = 20; workCount < workTotal; workCount++) {
            superWork = closureWork2(superWork);
        }
    }
    stop = process.hrtime();
    publishResults('layered', start, stop);
    // ---------- Execution
    start = process.hrtime();

    for (var i = 0; i < 2000000; ++i) {
        superWork();
    }
    stop = process.hrtime();
    publishResults('layered-execution', start, stop);
}
function publishResults(title, start, stop) {
    var startTime = start[0] * 1e9 + start[1];
    var stopTime = stop[0] * 1e9 + stop[1];
    console.log(title, (stopTime - startTime) / 1000);
}
