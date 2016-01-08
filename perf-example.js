var array = [1, 2, 3, 5, 7];
module.exports = function a() {
    array = array.reduce(function(next, value) {
        next.push(value + 3);
        return next;
    }, []);
    return array.reduce(function(sum, value) { return sum + value; }, 0);
};
