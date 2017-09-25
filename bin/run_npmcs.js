const parseArgs = require('./parse_args')
const buildCommand = require('./build_command')
const readScripts = require('./read_scripts')
const assign = require('./assign')
const { exec } = require("child_process");
const fs = require("fs");

module.exports = function() {

    let err;
    let scripts;

    scripts = readScripts();


    let args;

    args = parseArgs(process.argv);


    assign(args, scripts);

    let built;

    built = buildCommand(args);


    exec(built.qs, function(err) {
        const pkgJson = args.pkgJson;
        pkgJson.scripts = built.originalPkgJson;
        fs.writeFileSync("./package.json", JSON.stringify(pkgJson, null, 4));
        if (err) {
            process.stderr.write(`npmcs: error executing ${platform} scripts\n`);
            process.stderr.write(err);
            throw new Error(err);
        } else {
            process.stdout.write(
                `npmcs: succesfully executed ${platform} scripts in mode ${mode}`
            );
            throw new Error(err);
        }
        process.exit();
    });
}