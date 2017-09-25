const fs = require("fs");
const assign = require('./assign');

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

    let npmcsScript = options.npmcsScript;
    let mode = options.mode;
    let customPlatform = options.customPlatform;
    let commandToRun = options.commandToRun;
    let err;

    if (!npmcsScript) {
        err = "npmcs: npmcs-scripts.js file was not specified.";
    }

    npmcsScript.scripts = npmcsScript.scripts || {};

    if (!commandToRun) {
        err = 'npmcs: no command to run specified';
    }

    if (err) {
        throw new Error(err);
    }

    const scriptsBefore = {};


    let os = getPlatform();

    const scripts = npmcsScript.scripts[customPlatform || os] || npmcsScript.scripts;

    if (!commandToRun in npmcsScript.scripts) {
        err = `npmcs: could not locate ${commandToRun} in npmcs-scripts.js file.`;
    }

    const scriptCommand = scripts[commandToRun];

    let match;
    while (true) {
        let r = /(npm\s+run\s+)([a-zA-Z1-9]*)/g;
        match = r.exec(s);
        if (match == null) break;
        let scriptToReplace = match[2];
        if (!scriptToReplace in scripts) {
            throw new Error(`Invalid command ${scriptToReplace} does not exist in npmcs-scripts.js, cannot do npm run ${scriptToReplace}`)
        }
        scriptCommand = scriptCommand.replace(match[0], scripts[scriptToReplace])
    }

    let qs = buildEnvironmentalScript(
        npmcsScript["env"] ?
        npmcsScript["env"][customPlatform + "-" + mode] ||
        npmcsScript["env"][os + "-" + mode] ||
        npmcsScript["env"][customPlatform] ||
        npmcsScript["env"][os] ||
        npmcsScript["env"] :
        null
    );

    return qs;
}