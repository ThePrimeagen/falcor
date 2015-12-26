function a() {
    var now = Date.now();
    while (Date.now() - now < 250) {
    }
    b();
    while (Date.now() - now < 250) {
    }
    async();
}
function b() {
    while (Date.now() - now < 200) {
    }
    c();
    while (Date.now() - now < 200) {
    }
}
function c() {
    while (Date.now() - now < 100) {
    }
}

function async() {
    setTimeout(a, 0);
}

