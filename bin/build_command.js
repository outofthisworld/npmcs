const fs = require("fs");


/**
 * Gets the current platform in a simplified manner.
 * 
 * @returns 
 */
function getPlatform() {
    return process.platform === "win32" ? "win" : "nix";
}

/**
 * Finds the keyword for setting environmental varaiable in the current os.
 * 
 * @returns 
 */
function getOsEnvironmentalKeyword() {
    return getPlatform() == "win" ? "set " : "export ";
}

/**
 * Creates a string from a javascript object
 * that will enable setting multiple environmental variables for the current os.
 * @param {any} obj 
 * @returns 
 */
function buildEnvironmentalScript(obj) {
    let qs = "";
    let cmd = getOsEnvironmentalKeyword();
    if (!obj) return qs;
    for (key in obj) {
        qs += cmd + key + "=" + obj[key] + "&&";
    }
    return qs;
}

/**
 * Builds the command to be run by exec.
 * 
 * @param {any} scripts 
 */
module.exports = function(options) {

    if (!options) {
        throw new Error('Error no options provided');
        return;
    }

    let pkgJson = options.pkgJson;
    let npmcsScript = options.npmcsScript;
    let mode = options.mode;
    let customPlatform = options.customPlatform;
    let commandToRun = options.commandToRun;
    let err;

    if (!pkgJson) {
        err = "npmcs: package.json file was not specified.";
    }

    if (!npmcsScript) {
        err = "npmcs: npmcs-scripts.js file was not specified.";
    }

    pkgJson.scripts = pkgJson.scripts || {};
    npmcsScript.scripts = npmcsScript.scripts || {};

    if (!commandToRun in npmcsScript.scripts) {
        err = `npmcs: could not locate ${commandToRun} in npmcs-scripts.js file.`;
    }

    if (err) {
        throw new Error(err);
        process.exit();
    }

    const scriptsBefore = {};

    assign(scriptsBefore, pkgJson.scripts);
    assign(pkgJson.scripts, npmcsScript.scripts);

    fs.writeFileSync("./package.json", JSON.stringify(pkgJson, null, 4));

    let os = getPlatform();

    let qs = buildEnvironmentalScript(
        npmcsScript["env"] ?
        npmcsScript["env"][customPlatform + "-" + mode] ||
        npmcsScript["env"][os + "-" + mode] ||
        npmcsScript["env"][customPlatform] ||
        npmcsScript["env"][os] ||
        npmcsScript["env"] :
        null
    );

    return {
        originalPkgJson: scriptsBefore,
        qs: qs + pkgJson.scripts[commandToRun]
    }
}