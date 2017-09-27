const buildCommand = require('../bin/build_command');
const assert = require('assert');

describe('build command tests', function() {
    /*let pkgJson = options.pkgJson;
    let npmcsScript = options.npmcsScript;
    let mode = options.mode;
    let customPlatform = options.customPlatform;
    let commandToRun = options.commandToRun;*/

    function wrap(func, ...args) {
        return function() {
            return func.apply(undefined, args);
        }
    }

    it('throws an error when supplied param is null', function() {
        return assert.throws(wrap(buildCommand, null), Error);
    })

    it('throws an error when supplied param is undefined', function() {
        return assert.throws(wrap(buildCommand, undefined), Error);
    })

    it('throws an error when no options are given', function() {
        return assert.throws(wrap(buildCommand, {}), Error);
    })

    it('throws an error when pkgJson is not specified', function(done) {
        const fs = require('fs');
        const p = require('path');
        const path = p.join(p.dirname(__dirname), 'npmcs-scripts.js');

        function checkError() {
            const npmcsScript = require(path);
            try {
                buildCommand({
                    npmcsScript,
                    commandToRun: 'start'
                })
                done(new Error('Did not throw error when pkgJson was not specified'))
            } catch (err) {
                done();
            }
        }

        fs.open(path, "wx", function(err, fd) {
            // handle error
            if (err) {
                checkError();
                fs.close(fd, function(err) {});
                return;
            };

            fs.close(fd, function(err) {});
            fs.writeFile(path, 'module.exports = {}', function(err) {
                if (err) {
                    return done(err);
                }

                checkError();
            })
        });

    })

    it('throws an error when npmcsScript is not specified', function() {
        const pkgJson = require('../package');
        return assert.throws(wrap(buildCommand, {
            pkgJson,
            commandToRun: 'start'
        }))
    })

    it('throws an error when npmcsScript or pkgJson is not specified', function() {
        return assert.throws(wrap(buildCommand, {
            commandToRun: 'start'
        }), Error)
    })

    it('throws an error when command to run is not specified', function() {
        const pkgJson = require('../package');
        const npmcsScript = require('../npmcs-scripts')
        return assert.throws(wrap(buildCommand, {
            npmcsScript,
            pkgJson
        }), Error)
    })

    it('does not throw given pkgJson,npmcsScript and command to run.', function() {
        const pkgJson = require('../package');
        const npmcsScript = require('../npmcs-scripts')
        const commandToRun = 'start';
        npmcsScript.scripts = {
            start: ''
        }

        assert.doesNotThrow(wrap(buildCommand, {
            npmcsScript,
            pkgJson,
            commandToRun
        }), Error);
    })

    it('returns correct command string', function() {
        const pkgJson = require('../package');
        const npmcsScript = require('../npmcs-scripts')
        const commandToRun = 'start';

        npmcsScript.scripts = {
            start: ''
        }

        const result = buildCommand({
            npmcsScript,
            pkgJson,
            commandToRun
        })

        assert.equal(result.qs, '')

    })

    it('returns correct command string with environmental variables', function() {
        const pkgJson = require('../package');
        const npmcsScript = require('../npmcs-scripts')
        const commandToRun = 'start';

        npmcsScript.scripts = {
            start: 'node src/app.js'
        }

        npmcsScript.env = {
            NODE_ENV: 'development'
        }

        const result = buildCommand({
            npmcsScript,
            pkgJson,
            commandToRun
        })

        const cmd = process.platform === 'win32' ? 'set ' : 'export ';
        assert.equal(result.qs, cmd + "NODE_ENV=development&&node src/app.js")

    })


    it('returns original package.json scripts', function() {
        const pkgJson = require('../package');
        const npmcsScript = require('../npmcs-scripts')
        const commandToRun = 'start';

        npmcsScript.scripts = {
            start: 'node src/app.js'
        }

        npmcsScript.env = {
            NODE_ENV: 'development'
        }

        const result = buildCommand({
            npmcsScript,
            pkgJson,
            commandToRun
        })

        const cmd = process.platform === 'win32' ? 'set ' : 'export ';
        assert.deepEqual(result.originalPkgJson, pkgJson.scripts)
    })
})