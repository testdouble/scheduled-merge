module.exports = async function pullsWithLabel ({ label, github, owner, repo, log }) {
  log.info(`Searching for PRs labeled ${label.name}`)
  return github.issues.listForRepo({
    owner, repo, labels: label.data.name, state: 'open'
  }).catch(() => { log.info('No open PRs found') })
}
