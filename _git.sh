getBranchName() {
    echo $(git symbolic-ref --short -q HEAD);
}

makeAndFillFile() {
    touch _out/`getBranchName`-run
    cat performance/out/node-benchmark.csv >> _out/`getBranchName`-run
}

run() {
    git checkout $1
    node performance/node.js
    makeAndFillFile
}

run "master"
run "rm-closures-1"
run "rm-closures-2"
run "rm-closures-3"
run "rm-closures-4"
run "rm-closures-5"
run "rm-closures-6"
run "rm-closures-7"
run "rm-closures-8"
run "master"
run "rm-closures-1"
run "rm-closures-2"
run "rm-closures-3"
run "rm-closures-4"
run "rm-closures-5"
run "rm-closures-6"
run "rm-closures-7"
run "rm-closures-8"
run "master"
run "rm-closures-1"
run "rm-closures-2"
run "rm-closures-3"
run "rm-closures-4"
run "rm-closures-5"
run "rm-closures-6"
run "rm-closures-7"
run "rm-closures-8"

