const { Probot } = require('probot')

describe('scheduled-merge', () => {
  let probot, probotScheduler, app, api, nockApi

  beforeEach(() => {
    probot = new Probot({
      cert: '...',
      secret: '...',
      id: 12345,
      githubToken: 'test'
    })
    probotScheduler = td.replace('probot-scheduler')

    app = probot.load(require('..'))
    // app.app = () => 'test' // A fake token returned by the test
    api = nock('https://api.github.com')
  })

  test('starts probot-scheduler', async () => {
    td.verify(probotScheduler(app, {
      delay: false
    }))
  })

  test('does nothing when no label is found', async () => {
    // td.when(api.post('/app/installations/2/access_tokens'))
    //   .thenReturn({ token: 'test' })

    api.get('/repos/fakey/mcfakealot/labels/merge-2019-05-07')
      .reply(404)

    // nock('http://www.google.com')
    //   .get('/cat-poems')
    //   .replyWithError({
    //     message: 'something awful happened',
    //     code: 'AWFUL_ERROR',
    //   })

    await probot.receive({ name: 'schedule.repository',
      payload: {
        'repository': {
          'name': 'mcfakealot',
          'owner': {
            'login': 'fakey'
          }
        }
      }
    })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
