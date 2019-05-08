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
    ought.equal(nock.pendingMocks(), [])
    td.reset.onNextReset(() => nock.cleanAll())
    global.api = nock('https://api.github.com')
    setTimeout(() => {
      api.done()
    }, 700)
  },

  afterEach () {
    td.reset()
  }
}
