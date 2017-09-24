const buildCommand = require('../bin/index')

describe('build script tests', function() {

    it('throws an error with null as parameter', function(done) {
        try {
            buildCommand(null)
            done(new Error('test failed, no error given when running build script with null'))
        } catch (err) {
            done();
        }
    })
})