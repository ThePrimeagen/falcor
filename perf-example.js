module.exports = function a() {
    var currentTime = Date.now();
    while (Date.now() - currentTime < 5) { }
};
