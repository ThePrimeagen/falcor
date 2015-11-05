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

var ObjectWork = function ObjectWork(nextWorkObject, seed) {
    this.seed = seed || 0;
    this.next = nextWorkObject;
    this.disp = ['a', 'b', 'c', 'd'];
    this.myId = ++ID;
};

ObjectWork.prototype.run = function run() {
    var nextSeed = this.seed + 1;
    var otherStuff = '';
    if (this.next) {
        nextSeed += this.next.run();
    }

    for (var i = 0; i < this.disp.length; ++i) {
        otherStuff += this.disp[i];
    }

    if (otherStuff === 'abcd') {
        this.seed = nextSeed + this.myId;
    }

    return this.seed;
};


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
    publishResults('Closures', start, stop);

    // ---------- Execution
    start = process.hrtime();

    for (var i = 0; i < 2000000; ++i) {
        superWork();
    }
    stop = process.hrtime();
    publishResults('Closures-execution', start, stop);
    // ---------- objects
    // ---------- creation
    start = process.hrtime();

    seed = 0;
    for (i = 0; i < 2000000; ++i) {
        superWork = new ObjectWork(null, seed);
        for (workCount = 1, workTotal = 20; workCount < workTotal; workCount++) {
            superWork = new ObjectWork(superWork);
        }
    }
    stop = process.hrtime();
    publishResults('Object', start, stop);
    // ---------- Execution
    start = process.hrtime();

    for (var i = 0; i < 2000000; ++i) {
        superWork.run();
    }
    stop = process.hrtime();
    publishResults('Object-execution', start, stop);
}
function publishResults(title, start, stop) {
    var startTime = start[0] * 1e9 + start[1];
    var stopTime = stop[0] * 1e9 + stop[1];
    console.log(title, (stopTime - startTime) / 1000);
}
