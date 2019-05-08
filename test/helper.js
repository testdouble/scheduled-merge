global.td = require('testdouble')
global.nock = require('nock')
require('testdouble-jest')(td, jest)

beforeAll(function () {
  nock.disableNetConnect()

  process.on('unhandledRejection', error => {
    process.stderr.write(error.stack)
    process.exit(1)
  })
})

beforeEach(function () {
  td.reset.onNextReset(() => nock.cleanAll())
})

afterEach(function () {
  td.reset()
})
