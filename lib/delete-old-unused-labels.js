const labelOfTheDay = require('./label-of-the-day')
const pullsWithLabel = require('./pulls-with-label')

module.exports = async function ({ github, owner, repo, log }) {
  const todaysLabelName = labelOfTheDay()
  const labels = await repoLabels({ github, owner, repo, log })
  const oldMergeLabels = (labels || []).filter((label) => (
    label.name.startsWith('merge-') && label.name < todaysLabelName
  ))

  const oldMergeLabelPulls = await Promise.all(oldMergeLabels.map((label) => {
    return pullsWithLabel({ labelName: label.name, github, owner, repo, log })
  }))

  const oldUnusedMergeLabels = oldMergeLabels.filter((label, index) => {
    const pulls = oldMergeLabelPulls[index].data
    return (!pulls || !pulls.length)
  })

  return Promise.all(oldUnusedMergeLabels.map((label) => {
    return deleteLabel({ labelName: label.name, github, owner, repo, log })
  }))
}

function repoLabels ({ github, owner, repo, log }) {
  log.info(`Listing all labels for ${owner}/${repo}`)
  return github.paginate(github.issues.listLabelsForRepo.endpoint.merge({
    owner, repo
  })).catch(() => { log.info('Error fetching labels') })
}

function deleteLabel ({ labelName, github, owner, repo, log }) {
  log.info(`Deleting label ${labelName}`)
  return github.issues.deleteLabel({
    owner, repo, name: labelName
  }).catch(() => { log.info(`Deletion of label ${labelName} failed`) })
}
