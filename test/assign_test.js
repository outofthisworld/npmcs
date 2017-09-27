const assign = require('../bin/assign')
const assert = require('assert')

describe('build script tests', function () {
  it('assigns params to object', function () {
    const o1 = {
      mine: 1
    }

    const yours = {
      yours: 1
    }

    assign(o1, yours)

    assert.equal(o1.yours, 1)
  })
})
