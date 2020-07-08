global.td = require('testdouble')
global.nock = require('nock')
global.ought = require('ought')

module.exports = {
  beforeAll () {
    nock.disableNetConnect()

    process.on('unhandledRejection', error => {
      process.stderr.write(error.stack)
      process.exit(1)
    })
  },

  beforeEach () {
    nock.cleanAll()
  },

  afterEach () {
    ought.equal(nock.pendingMocks(), [])
    td.reset()
  }
}
