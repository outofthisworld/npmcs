#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const qs = require('querystring');
let pkgJson;
try {
    pkgJson = require(path.join(process.cwd(), 'package'));
} catch (err) {
    process.stderr.write('npmcs : ' + 'could not locate package.json file, are you running the command from the root project directory?');
    process.exit();
}
const { exec } = require('child_process');

let arg = process.argv[2];
let overridePlatform = process.argv[3];
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
        if (pkgJson.scripts['env'] && key === 'env') {
            process.stderr.write(`npcms: conflict 'env' script cannot exist within ${platform} scripts, please rename.`)
            process.exit();
        }
        pkgJson.scripts[key] = pkgJson.scripts[platform][key];
    }

    fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(pkgJson, null, 4));

    let os = process.platform === 'win32' ? 'win' : 'nix';
    let cmd = os == 'win' ? 'set ' : 'export ';

    let qs = (function createEnvironmentString(obj) {
        let qs = '';
        if (!obj) return qs;
        for (key in obj) {
            qs += cmd + key + '=' + obj[key] + '&&';
        }
        return qs;
    })(pkgJson.scripts[platform + '-env'] || pkgJson.scripts[os + '-env'] || pkgJson.scripts['env'])

    exec(qs + pkgJson.scripts[arg], function(err) {
        pkgJson.scripts = scriptsBefore;
        fs.writeFileSync('./package.json', JSON.stringify(pkgJson, null, 4));
        return callback(err);
    });
}

function run(platform) {
    execScriptForPlatform('win', function(err) {
        if (err) {
            process.stderr.write(`npmcs: error executing ${platform} scripts\n`);
            process.stderr.write(err);
        } else {
            process.stdout.write(`npmcs: succesfully executed ${platform} scripts`);
        }
        process.exit();
    });
}

if (process.platform === 'win32' && pkgJson.scripts.win) {
    run('win');
} else if (pkgJson.scripts.nix) {
    run('nix')
} else if (overridePlatform) {
    run(overridePlatform);
} else {
    process.stderr.write('npmcs: could not find scripts to run, is your package.json structure correct?');
}