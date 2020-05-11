const labelOfTheDay = require('./label-of-the-day')

// - Get all labels for repo
// - Filter repo labels down to those beginning with "merge-" and
//   that are < today's label
// - Get open issues for these filtered labels
// - Filter labels down to those with 0 open issues
// - Delete these filtered labels

// TODO: add tests
module.exports = async function ({ github, owner, repo, log }) {
  const todaysLabelName = labelOfTheDay()
  const labels = await repoLabels({ github, owner, repo, log })
  const oldMergeLabels = labels.filter((label) => (
    label.data.name.startsWith('merge-') && label.data.name < todaysLabelName
  ))

  const oldMergeLabelPulls = await Promise.all(oldMergeLabels.map((label) => {
    return pullsWithLabel({ label, github, owner, repo, log })
  }))

  const oldUnusedMergeLabels = oldMergeLabels.filter((label, index) => {
    const pulls = oldMergeLabelPulls[index]
    return (!pulls || !pulls.length)
  })

  return Promise.all(oldUnusedMergeLabels.map((label) => {
    return deleteLabel({ label, github, owner, repo, log })
  }))
}

// TODO: handle pagination
function repoLabels ({ github, owner, repo, log }) {
  log.info(`Listing all labels for ${owner}/${repo}`)
  return github.issues.listLabelsForRepo({
    owner, repo
  }).catch(() => { log.info('Error fetching labels') })
}

// TODO: extract, this is duplicated in merge-scheduled-posts
function pullsWithLabel ({ label, github, owner, repo, log }) {
  log.info(`Searching for PRs labeled ${label.data.name}`)
  return github.issues.listForRepo({
    owner, repo, labels: label.data.name, state: 'open'
  }).catch(() => { log.info('No open PRs found') })
}

function deleteLabel ({ label, github, owner, repo, log }) {
  log.info(`Deleting label ${label.data.name}`)
  return github.issues.deleteLabel({
    owner, repo, name: label.data.name
  }).catch(() => { log.info(`Deletion of label ${label.data.name} failed`) })
}
