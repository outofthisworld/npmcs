#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let npmcsScript;
let pkgJson;

try {
    npmcsScript = require(path.join(process.cwd(), 'npmcs-scripts'));
} catch (err) {
    process.stderr.write('npmcs : could not locate npmcs-script.js file, are you running the command from the root project directory?');
    process.exit();
}

try {
    pkgJson = require(path.join(process.cwd(), 'package'));
} catch (err) {
    process.stderr.write('npmcs : could not locate package.json file, are you running the command from the root project directory?');
    process.exit();
}

let arg = process.argv[2];

if (!arg) {
    process.stderr.write('npmcs: entry script must be supplied as an argument');
    process.exit();
}

let overridePlatform = process.argv[3];

let mode = overridePlatform === 'production' ? 'production' : overridePlatform === 'development' ? 'development' : process.argv[4];
overridePlatform = overridePlatform === 'production' || overridePlatform === 'development' ? null : overridePlatform;


(function run(scripts) {
    if (!scripts) {
        process.stderr.write('npmcs: could not find scripts to run, is your package.json structure correct?');
        process.exit();
    }
    (function(callback) {
        const scriptsBefore = {}

        for (key in pkgJson.scripts) {
            scriptsBefore[key] = pkgJson.scripts[key];
        }

        for (key in scripts) {
            pkgJson.scripts[key] = scripts[key];
        }

        fs.writeFileSync('./package.json', JSON.stringify(pkgJson, null, 4));

        let os = process.platform === 'win32' ? 'win' : 'nix';
        let cmd = os == 'win' ? 'set ' : 'export ';

        let qs = (function(obj) {
            let qs = '';
            if (!obj) return qs;
            for (key in obj) {
                qs += cmd + key + '=' + obj[key] + '&&';
            }
            return qs;
        })(npmcsScript['env'] ?
            npmcsScript['env'][overridePlatform + '-' + mode] ||
            npmcsScript['env'][os + '-' + mode] ||
            npmcsScript['env'][overridePlatform] ||
            npmcsScript['env'][os] ||
            npmcsScript['env'] : null
        );

        exec(qs + pkgJson.scripts[arg], function(err) {
            pkgJson.scripts = scriptsBefore;
            fs.writeFileSync('./package.json', JSON.stringify(pkgJson, null, 4));
            return callback(err);
        });
    })(function(err) {
        if (err) {
            process.stderr.write(`npmcs: error executing ${platform} scripts\n`);
            process.stderr.write(err);
        } else {
            process.stdout.write(`npmcs: succesfully executed ${platform} scripts in mode ${mode}`);
        }
        process.exit();
    });
})(overridePlatform && npmcsScript.scripts[overridePlatform] ?
    npmcsScript.scripts[overridePlatform] : process.platform === 'win32' && npmcsScript.scripts.win ?
    npmcsScript.scripts.win : npmcsScript.scripts.nix ? npmcsScript.scripts.nix : null)