/**
 * Reads npmcs-scripts.js file from process.cwd()
 * 
 * @returns result of reading npmcs-scripts.js file
 */
function readNpmcsScripts() {
    return require("./npmcs-scripts");
}

/**
 * Reads package.json file from process.cwd()
 * 
 * @returns result of reading package.json file
 */
function readPackageJsonFile() {
    return require("./package");
}

module.exports = function() {
    let npmcsScript = readNpmcsScripts();
    let pkgJson = readPackageJsonFile();
    return {
        pkgJson,
        npmcs
    }
}