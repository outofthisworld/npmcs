const parseArgs = require('./parse_args')
const buildCommand = require('./build_command')
const { exec } = require('child_process')
const path = require('path')

module.exports = function () {
  let args = parseArgs(process.argv)
  args.npmcsScript = require(path.join(process.cwd(), 'npmcs-scripts'))
  let cmd = buildCommand(args)

  process.stdout.write(`npmcs running command: ${cmd}\n`)

  exec(cmd, function (err) {
    if (err) {
      process.stderr.write(`npmcs: error executing scripts\n`)
      process.stderr.write(err)
    } else {
      process.stdout.write(`npmcs: succesfully executed commands`)
    }
  })
}
