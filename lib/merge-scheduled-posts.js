const labelOfTheDay = require('./label-of-the-day')
const handleMergeFailure = require('./handle-merge-failure')
const pullsWithLabel = require('./pulls-with-label')

module.exports = async function ({ github, owner, repo, log }) {
  const label = await findTodaysLabel({ github, owner, repo, log })
  if (label) {
    const pulls = await pullsWithLabel({
      labelName: label.data.name,
      github,
      owner,
      repo,
      log
    })
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
