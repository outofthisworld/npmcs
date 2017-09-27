const parseArgs = require('../bin/parse_args')
const assert = require('assert')

describe('test parge_args.js', function () {
  it('throws an error when passed a non array argument - undefined', function () {
    assert.throws(function () { parseArgs(undefined) }, Error)
  })

  it('throws an error when passed a non array argument - null', function () {
    assert.throws(function () { parseArgs(null) }, Error)
  })

  it('throws an error when passed a non array argument - empty object', function () {
    assert.throws(function () { parseArgs({}) }, Error)
  })

  it('parses args correctly with one argument', function () {
    const result = parseArgs([undefined, undefined, 'start'])
    assert.equal(result.commandToRun, 'start')
  })

  it('parses args correctly with development arg', function () {
    const result = parseArgs([undefined, undefined, 'start', 'development'])
    assert.equal(result.mode, 'development')
  })

  it('parses args correctly with production arg', function () {
    const result = parseArgs([undefined, undefined, 'start', 'production'])
    assert.equal(result.mode, 'production')
  })

  it('customPlatform is null when second argument is development', function () {
    const result = parseArgs([undefined, undefined, 'start', 'development'])
    assert.equal(result.customPlatform, null)
    assert.equal(result.mode, 'development')
    assert.equal(result.commandToRun, 'start')
  })

  it('parses args correctly with three arguments', function () {
    const result = parseArgs([undefined, undefined, 'start', 'custom', 'development'])
    assert.equal(result.customPlatform, 'custom')
    assert.equal(result.mode, 'development')
    assert.equal(result.commandToRun, 'start')
  })
})
