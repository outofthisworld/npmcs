module.exports = function assign(to, from, replace = true) {
    for (key in from) {
        if (to[key] && !replace) continue;
        to[key] = from[key];
    }
}