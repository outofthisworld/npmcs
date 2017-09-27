const run = require('../bin/run_npmcs')
const assert = require('assert')

describe('run_npmcs tests', function () {
  it('Errors with no arguments provided', function () {
    assert.throws(run, Error)
  })

  it('Does not error with argument provided', function () {
    process.argv = ['', '', 'start']
    assert.doesNotThrow(run)
  })
  it('Does not error with two arguments provided', function () {
    process.argv = ['', '', 'start', 'development']
    assert.doesNotThrow(run)
  })
  it('Does not error with three arguments provided', function () {
    process.argv = ['', '', 'start', 'custom', 'development']
    assert.doesNotThrow(run)
  })
})
