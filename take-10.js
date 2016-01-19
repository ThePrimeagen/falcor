var array = [1, 3, 5, 7, 9, 11];
function take5() {
    for (var i = 0; i < 1000000; ++i) {
        array = array.map(x => x + 1);
    }
}

for (var j = 0; j < 16; ++j) {
    take5();
}
