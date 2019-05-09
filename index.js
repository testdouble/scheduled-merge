const probotScheduler = require('probot-scheduler')

const run = require('./lib/run')

module.exports = app => {
  probotScheduler(app, {
    delay: process.env.NODE_ENV === 'production'
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
