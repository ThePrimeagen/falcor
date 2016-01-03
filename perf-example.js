module.exports = function a() {
    var previousTime = Date.now();
    while (Date.now() - previousTime < 5) { }
};
