module.exports = function assign (to, from, replace = true) {
  for (let key in from) {
    if (to[key] && !replace) continue
    to[key] = from[key]
  }
}
