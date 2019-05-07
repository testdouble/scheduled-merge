const { Probot } = require('probot')

describe('scheduled-merge', () => {
  let probot, probotScheduler, app, api

  beforeEach(() => {
    api = nock('https://api.github.com')
    probot = new Probot({
      githubToken: 'test'
    })

    probotScheduler = td.replace('probot-scheduler')
    app = probot.load(require('..'))
  })

  test('starts probot-scheduler', async () => {
    td.verify(probotScheduler(app, {
      delay: false
    }))
  })

  test('does nothing when no label is found', async () => {
    api.filteringPath(/\d{4}-\d{2}-\d{2}/g, 'YYYY-MM-DD')
      .get('/repos/fake/stuff/labels/merge-YYYY-MM-DD')
      .reply(404)

    await probot.receive({ name: 'schedule.repository',
      payload: {
        'repository': {
          'name': 'stuff',
          'owner': {
            'login': 'fake'
          }
        }
      }
    })
  })
})
