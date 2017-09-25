const parseArgs = require('./parse_args')
const buildCommand = require('./build_command')
const assign = require('./assign')
const { exec } = require("child_process");
const fs = require("fs");

module.exports = function() {
    let args = parseArgs(process.argv);
    args.npmcsScript = require(path.join(process.cwd(), "npmcs-scripts"))
    let cmd = buildCommand(args);

    exec(cmd, function(err) {
        if (err) {
            process.stderr.write(`npmcs: error executing ${platform} scripts\n`);
            process.stderr.write(err);
        } else {
            process.stdout.write(`npmcs: succesfully executed commands`);
        }
    });
}