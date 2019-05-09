module.exports = async function ({ error, pull, github, owner, repo }) {
  await ensureFailureLabelExists({ github, owner, repo })
  await assignLabel({ pull, github, owner, repo })
  return addComment({ error, pull, github, owner, repo })
}

function ensureFailureLabelExists ({ github, owner, repo }) {
  return github.issues.getLabel({ owner, repo, name: 'merge-failed' }).catch(() => {
    return github.issues.createLabel({ owner, repo, name: 'merge-failed', color: 'cc0000' })
  })
}

function assignLabel ({ pull, github, owner, repo }) {
  return github.issues.addLabels({
    owner,
    repo,
    issue_number: pull.number,
    labels: ['merge-failed']
  })
}

function addComment ({ error, pull, github, owner, repo }) {
  return github.issues.createComment({
    owner,
    repo,
    issue_number: pull.number,
    body: `Failed to automatically merge with error: **${error.message}**`
  })
}
