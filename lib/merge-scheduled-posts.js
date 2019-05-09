const labelOfTheDay = require('./label-of-the-day')

module.exports = async function run ({ github, owner, repo, log }) {
  const label = findTodaysLabel({ github, owner, repo, log })
  if (label) {
    const pulls = pullsWithLabel({ label, github, owner, repo, log })
    await Promise.all(pulls.data.map(async pull => {
      mergePull({ pull, github, owner, repo, log })
    }))
  }
}

async function findTodaysLabel ({ github, owner, repo, log }) {
  const labelName = labelOfTheDay()
  log.debug(`Searching for open PRs for ${owner}/${repo} with label ${labelName}`)
  await github.issues.getLabel({
    owner, repo, name: labelName
  }).catch(() => { log.debug(`No label named ${labelName}`) })
}

async function pullsWithLabel ({ label, github, owner, repo, log }) {
  log.debug(`Searching for PRs labeled ${label.name}`)
  await github.issues.listForRepo({
    owner, repo, labels: label.data.name, state: 'open'
  }).catch(() => { log.debug('No open PRs found') })
}

async function mergePull ({ pull, github, owner, repo, log }) {
  log.debug(`Merging PR: ${pull.url}`)
  if (pull.labels.find(l => l.name === 'merge-failed')) {
    log.debug('Skipping because `merge-failed` label was applied.')
    return false
  } else {
    return github.pulls.merge({
      owner,
      repo,
      pull_number: pull.number
    }).catch(e => {
      return github.issues.createComment({
        owner,
        repo,
        issue_number: pull.number,
        body: `Failed to automatically merge with error: **${e.message}**`
      })
    })
  }
}
