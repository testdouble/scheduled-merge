# scheduled-merge

A GitHub App built with [Probot](https://github.com/probot/probot) that Merges
PRs on a specified date using Labels.

Each time the app is run, will merge any open pull requests with a label
matching pattern `merge-YYYY-MM-DD` (e.g.  `merge-2019-05-07`). If automated
merge fails, the app will leave a comment with the error.

(The initial implementation is very naive, and will run 24 times (once per
hour), which could lead to a lot of comments on a lot of PRs if they aren't
mergeable!)

To deploy your own instance, check out [the Probot docs](https://probot.github.io/docs/deployment/#heroku)
