const buildCommand = require('../bin/build_command')
const assert = require('assert')

describe('build command tests', function () {
  function wrap (func, ...args) {
    return function () {
      return func.apply(undefined, args)
    }
  }

  it('throws an error when supplied param is null', function () {
    return assert.throws(wrap(buildCommand, null), Error)
  })

  it('throws an error when supplied param is undefined', function () {
    return assert.throws(wrap(buildCommand, undefined), Error)
  })

  it('throws an error when no options are given', function () {
    return assert.throws(wrap(buildCommand, {}), Error)
  })

  it('throws an error when npmcsScript is not specified', function () {
    return assert.throws(wrap(buildCommand, {
      commandToRun: 'start'
    }))
  })

  it('throws an error when command to run is not specified', function () {
    const npmcsScript = require('../npmcs-scripts')
    return assert.throws(wrap(buildCommand, {
      npmcsScript
    }), Error)
  })

  it('returns correct command string', function () {
    const npmcsScript = {}
    const commandToRun = 'start'

    npmcsScript.scripts = {
      start: 'hello',
      win: {
        start: 'test'
      }
    }

    let result = buildCommand({
      npmcsScript,
      commandToRun
    })

    assert.equal(result, process.platform == 'win32' ? 'test' : 'hello')

    npmcsScript.scripts = {
      start: 'test1',
      win: {
        start: 'test'
      }
    }

    result = buildCommand({
      npmcsScript,
      commandToRun
    })

    assert.equal(result, process.platform == 'win32' ? 'test' : 'test1')

    npmcsScript.scripts = {
      start: 'test1'
    }

    result = buildCommand({
      npmcsScript,
      commandToRun
    })

    assert.equal(result, 'test1')
  })

  it('returns correct command string with environmental variables', function () {
    const npmcsScript = require('../npmcs-scripts')
    const commandToRun = 'start'

    npmcsScript.scripts = {
      start: 'node src/app.js'
    }

    npmcsScript.env = {
      NODE_ENV: 'development'
    }

    let result = buildCommand({
      npmcsScript,
      commandToRun
    })

    function isUsingPowerShell () {
      return process.env.PATHEXT && process.env.PATHEXT.toLowerCase().includes('.cpl')
    }
    const cmd = process.platform === 'win32' ? !isUsingPowerShell() ? 'set ' : '$env:' : 'export '
    assert.equal(result, cmd + 'NODE_ENV=development&&node src/app.js')

    npmcsScript.env = {
      NODE_ENV: 'development',
      win: {
        NODE_ENV: 'production'
      }
    }

    result = buildCommand({
      npmcsScript,
      commandToRun
    })

    assert.equal(result, process.platform === 'win32'
      ? cmd + 'NODE_ENV=production&&node src/app.js' : cmd + 'NODE_ENV=development&&node src/app.js')
  })

  it('replaces npm run option with command', function () {
    let npmcsScript = {}
    npmcsScript.scripts = {
      start: 'npm run hi',
      hi: 'hello'
    }

    const result = buildCommand({
      npmcsScript,
      commandToRun: 'start'
    })

    assert.equal(result, 'hello')
  })

  it('replaces two npm run options with command', function () {
    let npmcsScript = {}
    npmcsScript.scripts = {
      start: 'npm run hi',
      hi: 'npm run other',
      other: 'other'
    }

    const result = buildCommand({
      npmcsScript,
      commandToRun: 'start'
    })

    assert.equal(result, 'other')
  })
})
