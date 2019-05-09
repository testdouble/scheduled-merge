const probotScheduler = require('probot-scheduler')

const run = require('./lib/run')
// require('nock').recorder.rec({ gunzip: true })

module.exports = app => {
  probotScheduler(app, {
    delay: process.env.NODE_ENV === 'production'
  })
  app.on('schedule.repository', async function (context) {
    const { owner, repo } = context.repo({ logger: app.log })
    run({
      owner,
      repo,
      github: context.github,
      log: app.log
    })
  })
}
