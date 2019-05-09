const mergeScheduledPosts = require('./merge-scheduled-posts')

module.exports = async function ({ github, owner, repo, log }) {
  mergeScheduledPosts({ github, owner, repo, log })
}
