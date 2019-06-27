const probotScheduler = require('probot-scheduler')

const run = require('./lib/run')

const halfHour = 30 * 60 * 1000

module.exports = app => {
  probotScheduler(app, {
    delay: process.env.NODE_ENV === 'production',
    interval: halfHour
  })
  app.on('schedule.repository', function (context) {
    const { owner, repo } = context.repo({ logger: app.log })
    return run({
      owner,
      repo,
      github: context.github,
      log: app.log
    })
  })
}
