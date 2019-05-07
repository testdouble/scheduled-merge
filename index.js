const probotScheduler = require('probot-scheduler')

module.exports = app => {
  probotScheduler(app, {
    delay: process.env.NODE_ENV === 'production'
  })
  app.on('schedule.repository', async function (context) {
    const github = context.github
    const { owner, repo } = context.repo({ logger: app.log })
    const labelName = todaysLabelName()
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

      pulls.data.forEach(pull => {
        app.log.debug(`Merging PR: ${pull.url}`)
        github.pulls.merge({
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
      })
    }
  })
}

// Ripped right off SO:
// https://stackoverflow.com/questions/23593052/format-javascript-date-to-yyyy-mm-dd
function todaysLabelName () {
  const d = new Date()
  let month = String(d.getMonth() + 1)
  let day = String(d.getDate())

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return `merge-${d.getFullYear()}-${month}-${day}`
}
