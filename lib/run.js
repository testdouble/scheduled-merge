const mergeScheduledPosts = require('./merge-scheduled-posts')

module.exports = function ({ github, owner, repo, log }) {
  return mergeScheduledPosts({ github, owner, repo, log })
}
