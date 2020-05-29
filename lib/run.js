const deleteOldUnusedLabels = require('./delete-old-unused-labels')
const mergeScheduledPosts = require('./merge-scheduled-posts')

module.exports = function ({ github, owner, repo, log }) {
  return Promise.all([
    deleteOldUnusedLabels({ github, owner, repo, log }),
    mergeScheduledPosts({ github, owner, repo, log })
  ])
}
