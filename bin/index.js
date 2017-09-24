#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

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

let arg = process.argv[2];

if (!arg) {
    process.stderr.write("npmcs: entry script must be supplied as an argument");
    process.exit();
}

let overridePlatform = process.argv[3];

let mode =
    overridePlatform === "production" ?
    "production" :
    overridePlatform === "development" ? "development" : process.argv[4];
overridePlatform =
    overridePlatform === "production" || overridePlatform === "development" ?
    null :
    overridePlatform;

/**
 * 
 * 
 * @returns result of reading npmcs-scripts.js file
 */
function readNpmcsScripts() {
    return require(path.join(process.cwd(), "npmcs-scripts"));
}

/**
 * 
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
 * 
 * 
 * @param {any} pkgJson 
 */
function writePackageJsonFile(pkgJson) {
    fs.writeFileSync("./package.json", JSON.stringify(pkgJson, null, 4));
}

/**
 * 
 * 
 * @returns 
 */
function getPlatform() {
    return process.platform === "win32" ? "win" : "nix";
}

/**
 * 
 * 
 * @returns 
 */
function getOsEnvironmentalKeyword() {
    return os == "win" ? "set " : "export ";
}

/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
function buildEnvironmentalScript(obj) {
    let qs = "";
    if (!obj) return qs;
    for (key in obj) {
        qs += cmd + key + "=" + obj[key] + "&&";
    }
    return qs;
}

/**
 * 
 * 
 * @param {any} scripts 
 */
function run(scripts) {
    if (!scripts) {
        throw new Error(
            "npmcs: could not find scripts to run, is your npmcs-scripts.js structure correct?"
        );
        process.exit();
    }

    const scriptsBefore = {};

    assign(scriptsBefore, pkgJson.scripts);
    assign(pkgJson.scripts, scripts);

    writePackageJsonFile(pkgJson);

    let os = getPlatform();
    let cmd = os == getOsEnvironmentalKeyword();

    let qs = buildEnvironmentalScript(
        npmcsScript["env"] ?
        npmcsScript["env"][overridePlatform + "-" + mode] ||
        npmcsScript["env"][os + "-" + mode] ||
        npmcsScript["env"][overridePlatform] ||
        npmcsScript["env"][os] ||
        npmcsScript["env"] :
        null
    );

    exec(qs + pkgJson.scripts[arg], function(err) {
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
}

run(
    overridePlatform && npmcsScript.scripts[overridePlatform] ?
    npmcsScript.scripts[overridePlatform] :
    process.platform === "win32" && npmcsScript.scripts.win ?
    npmcsScript.scripts.win :
    npmcsScript.scripts.nix ? npmcsScript.scripts.nix : null
);