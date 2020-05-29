module.exports = async function pullsWithLabel ({ labelName, github, owner, repo, log }) {
  log.info(`Searching for PRs labeled ${labelName}`)
  return github.issues.listForRepo({
    owner, repo, labels: labelName, state: 'open'
  }).catch(() => { log.info('No open PRs found') })
}
