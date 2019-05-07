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
    api.get('/repos/fake/stuff/labels/merge-2019-05-07')
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
