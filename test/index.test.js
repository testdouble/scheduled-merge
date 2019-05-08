const { Probot } = require('probot')
const labelOfTheDay = require('../lib/label-of-the-day')

describe('scheduled-merge', () => {
  let probot, probotScheduler, app, api, label

  beforeEach(() => {
    api = nock('https://api.github.com')
    probot = new Probot({
      githubToken: 'test'
    })
    label = labelOfTheDay()

    probotScheduler = td.replace('probot-scheduler')
    app = probot.load(require('..'))
  })

  test('starts probot-scheduler', async () => {
    td.verify(probotScheduler(app, {
      delay: false
    }))
  })

  test('does nothing when no label is found', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`)
      .reply(404, {
        message: 'Not Found',
        documentation_url: 'https://developer.github.com/v3/issues/labels/#get-a-single-label'
      })

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

  test('does nothing when label is found but no pulls are open', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [])

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

  test('merges PR when labeled, open, and mergeable', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [{
        url: 'fake pull url',
        number: 999,
        labels: [{ name: label }],
        state: 'open'
      }])

    api.put('/repos/fake/stuff/pulls/999/merge').reply(200)

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
