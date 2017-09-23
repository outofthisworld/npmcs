#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
try {
    const pkgJson = require(path.join(process.cwd(), 'packag'));
} catch (err) {
    process.stderr.write('npmcs : ' + 'could not locate package.json file, are you running the command from the root project directory?');
    process.exit();
}
const { exec } = require('child_process');

let arg = process.argv[2];

if (!arg) {
    process.stderr.write('npmcs: entry script must be supplied as an argument');
    process.exit();
}

function execScriptForPlatform(platform, callback) {
    const scriptsBefore = {}
    for (key in pkgJson.scripts) {
        scriptsBefore[key] = pkgJson.scripts[key];
    }
    for (key in pkgJson.scripts[platform]) {
        pkgJson.scripts[key] = pkgJson.scripts[platform][key];
    }
    fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(pkgJson, null, 4));
    exec(pkgJson.scripts[arg], function(err) {
        pkgJson.scripts = scriptsBefore;
        fs.writeFileSync('./package.json', JSON.stringify(pkgJson, null, 4));
        return callback(err);
    });
}

if (process.platform === 'win32' && pkgJson.scripts.win) {
    execScriptForPlatform('win', function(err) {
        if (err) {
            process.stderr.write('npmcs: error executing win scripts\n');
            process.stderr.write(err);
        } else {
            process.stdout.write('npmcs: succesfully executed win scripts');
        }
    });
} else if (pkgJson.scripts.nix) {
    execScriptForPlatform('nix', function(err) {
        if (err) {
            process.stderr.write('npmcs: error executing nix scripts\n');
            process.stderr.write(err);
        } else {
            process.stdout.write('npmcs: succesfully executed nix scripts');
        }
    });
} else {
    process.stderr.write('Could not find script for platform');
}