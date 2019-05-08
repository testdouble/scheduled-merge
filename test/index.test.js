const labelOfTheDay = require('../lib/label-of-the-day')
const Fauxbot = require('./fauxbot')

describe('scheduled-merge', () => {
  let fauxbot, api, label

  beforeEach(() => {
    fauxbot = new Fauxbot({
      probotScheduler: td.replace('probot-scheduler'),
      appFn: require('..')
    })
    api = nock('https://api.github.com')
    label = labelOfTheDay()
  })

  test('starts probot-scheduler', async () => {
    td.verify(fauxbot.probotScheduler(fauxbot.app, {
      delay: false
    }))
  })

  test('does nothing when no label is found', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`)
      .reply(404, {
        message: 'Not Found',
        documentation_url: 'https://developer.github.com/v3/issues/labels/#get-a-single-label'
      })

    await fauxbot.trigger()
  })

  test('does nothing when label is found but no pulls are open', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [])

    await fauxbot.trigger()
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

    await fauxbot.trigger()
  })

  test('leaves a comment when a PR is not mergeable', async () => {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [{ number: 999 }])

    api.put('/repos/fake/stuff/pulls/999/merge')
      .reply(405, { 'message': 'Pull Request is not mergeable' })

    api.post('/repos/fake/stuff/issues/999/comments', {
      body: 'Failed to automatically merge with error: **Pull Request is not mergeable**'
    }).reply(201)

    await fauxbot.trigger()
  })
})
