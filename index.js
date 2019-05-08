const probotScheduler = require('probot-scheduler')
const labelOfTheDay = require('./lib/label-of-the-day')
// require('nock').recorder.rec({ gunzip: true })

module.exports = app => {
  probotScheduler(app, {
    delay: process.env.NODE_ENV === 'production'
  })
  app.on('schedule.repository', async function (context) {
    const github = context.github
    const { owner, repo } = context.repo({ logger: app.log })
    const labelName = labelOfTheDay()
    app.log.debug(`Searching for open PRs for ${owner}/${repo} with label ${labelName}`)
    const label = await github.issues.getLabel({
      owner, repo, name: labelName
    }).catch(() => { app.log.debug(`No label named ${labelName}`) })

    if (label) {
      app.log.debug(`Searching for PRs labeled ${labelName}`)
      const labels = label.data.name
      const pulls = await github.issues.listForRepo({
        owner, repo, labels, state: 'open'
      }).catch(() => { app.log.debug('No open PRs found') })

      await Promise.all(pulls.data.map(pull => {
        app.log.debug(`Merging PR: ${pull.url}`)
        return github.pulls.merge({
          owner,
          repo,
          pull_number: pull.number
        }).catch(e => {
          github.issues.createComment({
            owner,
            repo,
            issue_number: pull.number,
            body: `Failed to automatically merge with error: **${e.message}**`
          })
        })
      }))
    }
  })
}
