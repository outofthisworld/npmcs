#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

/**
 * Pases command line arguments.
 * 
 * @returns 
 */
function parseArgs() {
    let npmcsScript;
    let pkgJson;

    try {
        npmcsScript = readNpmcsScripts();
    } catch (err) {
        process.stderr.write(
            "npmcs : could not locate npmcs-script.js file, are you running the command from the root project directory?"
        );
        process.exit();
    }

    try {
        pkgJson = readPackageJsonFile();
    } catch (err) {
        process.stderr.write(
            "npmcs : could not locate package.json file, are you running the command from the root project directory?"
        );
        process.exit();
    }

    let commandToRun = process.argv[2];

    if (!commandToRun) {
        process.stderr.write("npmcs: entry script must be supplied as an argument");
        process.exit();
    }

    let customPlatform = process.argv[3];

    let mode =
        customPlatform === "production" ?
        "production" :
        customPlatform === "development" ? "development" : process.argv[4];

    customPlatform =
        customPlatform === "production" || customPlatform === "development" ?
        null :
        customPlatform;

    return {
        /* The npmcs script object */
        npmcsScript,
        /* pkgJson object */
        pkgJson,
        /* The command to run*/
        commandToRun,
        /* Set if the user has specified there own platform */
        customPlatform,
        /* production or development mode */
        mode
    };
}

/**
 * Reads npmcs-scripts.js file from process.cwd()
 * 
 * @returns result of reading npmcs-scripts.js file
 */
function readNpmcsScripts() {
    return require(path.join(process.cwd(), "npmcs-scripts"));
}

/**
 * Reads package.json file from process.cwd()
 * 
 * @returns result of reading package.json file
 */
function readPackageJsonFile() {
    return require(path.join(process.cwd(), "package"));
}

/**
 * @param {any} An object to assign properties to 
 * @param {any} The object to assign properties from 
 * @param {boolean} [replace=true] True if keys should be overriden when being copied.
 */
function assign(to, from, replace = true) {
    for (key in from) {
        if (to[key] && !replace) continue;
        to[key] = from[key];
    }
}

/**
 * Writes the package.json file from a javascript pkgJson object.
 * 
 * @param {any} pkgJson 
 */
function writePackageJsonFile(pkgJson) {
    fs.writeFileSync("./package.json", JSON.stringify(pkgJson, null, 4));
}

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
function buildCommand(options) {
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

    if (!commandToRun in npmcsScript) {
        err = `npmcs: could not locate ${commandToRun} in npmcs-scripts.js file.`;
    }

    if (err) {
        throw new Error(err);
        process.exit();
    }

    const scriptsBefore = {};

    assign(scriptsBefore, pkgJson.scripts);
    assign(pkgJson.scripts, scripts);

    writePackageJsonFile(pkgJson);

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

    return qs + pkgJson.scripts[commandToRun];
}

exec(buildCommand(parseArgs()), function(err) {
    pkgJson.scripts = scriptsBefore;
    writePackageJsonFile(pkgJson);
    if (err) {
        process.stderr.write(`npmcs: error executing ${platform} scripts\n`);
        process.stderr.write(err);
    } else {
        process.stdout.write(
            `npmcs: succesfully executed ${platform} scripts in mode ${mode}`
        );
    }
    process.exit();
});

module.exports = buildCommand;