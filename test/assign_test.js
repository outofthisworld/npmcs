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

  it('doesnt override params if option set to false', function () {
    const o1 = {
      mine: 1
    }

    const yours = {
      yours: 1,
      mine: 2
    }

    assign(o1, yours, false)

    assert.equal(o1.yours, 1)
    assert.equal(o1.mine, 1)
  })
})
