const buildCommand = require('../bin/build_command');
const assert = require('assert');

describe('build command tests', function() {
    let pkgJson = options.pkgJson;
    let npmcsScript = options.npmcsScript;
    let mode = options.mode;
    let customPlatform = options.customPlatform;
    let commandToRun = options.commandToRun;


    const mockArgs = {

    }

    it('throws an error when supplied param is null', function() {
        try {
            buildCommand(null);
            throw new Error('build command did not throw error with null parameter.')
        } catch (err) {}
    })

    it('throws an error when pkgJson is not specified', function() {

    })

    it('throws an error when npmcsScript is not specified', function() {

    })

    it('throws an error when npmcsScript or pkgJson is not specified', function() {

    })

    it('throws an error when command to run is not specified', function() {

    })
})