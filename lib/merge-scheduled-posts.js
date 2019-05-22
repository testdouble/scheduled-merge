const labelOfTheDay = require('./label-of-the-day')
const handleMergeFailure = require('./handle-merge-failure')

module.exports = async function ({ github, owner, repo, log }) {
  const label = await findTodaysLabel({ github, owner, repo, log })
  if (label) {
    const pulls = await pullsWithLabel({ label, github, owner, repo, log })
    await Promise.all(pulls.data.map(async pull => {
      return mergePull({ pull, github, owner, repo, log })
    }))
  }
}

function findTodaysLabel ({ github, owner, repo, log }) {
  const labelName = labelOfTheDay()
  log.info(`Searching for open PRs for ${owner}/${repo} with label ${labelName}`)
  return github.issues.getLabel({
    owner, repo, name: labelName
  }).catch(() => { log.info(`No label named ${labelName}`) })
}

function pullsWithLabel ({ label, github, owner, repo, log }) {
  log.info(`Searching for PRs labeled ${label.name}`)
  return github.issues.listForRepo({
    owner, repo, labels: label.data.name, state: 'open'
  }).catch(() => { log.info('No open PRs found') })
}

async function mergePull ({ pull, github, owner, repo, log }) {
  log.info(`Merging PR: ${pull.url}`)
  if (pull.labels.find(l => l.name === 'merge-failed')) {
    log.info('Skipping because `merge-failed` label was applied.')
    return false
  } else {
    return github.pulls.merge({
      owner,
      repo,
      pull_number: pull.number
    }).catch(error => {
      return handleMergeFailure({ error, pull, github, owner, repo, log })
    })
  }
}
