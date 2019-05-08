const { Probot } = require('probot')
const octokit = require('@octokit/rest')

module.exports = class Fauxbot {
  constructor ({ appFn, probotScheduler }) {
    this.probot = new Probot({
      Octokit: octokit, // prevent retries
      githubToken: 'test' // make probot-scheduler work
    })
    this.probotScheduler = probotScheduler
    this.app = this.probot.load(appFn)
  }

  trigger () {
    return this.probot.receive({ name: 'schedule.repository',
      payload: {
        'repository': {
          'name': 'stuff',
          'owner': {
            'login': 'fake'
          }
        }
      }
    })
  }
}
