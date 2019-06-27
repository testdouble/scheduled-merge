# scheduled-merge

A GitHub App built with [Probot](https://github.com/probot/probot) that merges PRs on a specified date and hour using Labels.

Each time the app is run, will merge any open pull requests with a label
matching pattern `merge-YYYY-MM-DD-HH` (e.g.  `merge-2019-05-07-22`). If automated
merge fails, the app will leave a comment with the error.

This implementation will run 48 times daily, once per 30 min.  This could lead to many comments on PRs which aren't mergeable.

To deploy an instance check out [the Probot docs](https://probot.github.io/docs/deployment/#heroku)
