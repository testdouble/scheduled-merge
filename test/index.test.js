const labelOfTheDay = require('../lib/label-of-the-day')
const Fauxbot = require('./fauxbot')

let fauxbot, label, api
module.exports = {
  beforeEach () {
    api = nock('https://api.github.com')
    fauxbot = new Fauxbot({
      probotScheduler: td.replace('probot-scheduler'),
      appFn: require('..')
    })
    label = labelOfTheDay()
  },

  async 'starts probot-scheduler' () {
    td.verify(fauxbot.probotScheduler(fauxbot.app, {
      delay: false
    }))
  },

  async 'does nothing when no label is found' () {
    api.get(`/repos/fake/stuff/labels/${label}`)
      .reply(404, {
        message: 'Not Found',
        documentation_url: 'https://developer.github.com/v3/issues/labels/#get-a-single-label'
      })

    await fauxbot.trigger()
  },

  async 'does nothing when label is found but no pulls are open' () {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [])

    await fauxbot.trigger()
  },

  async 'does nothing when `merge-failed` label is applied' () {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [{
        url: 'fake pull url',
        number: 999,
        labels: [{ name: label }, { name: 'merge-failed' }],
        state: 'open'
      }])

    await fauxbot.trigger()
  },

  async 'merges PR when labeled, open, and mergeable' () {
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
  },

  async 'leaves a comment when a PR is not mergeable & labels merge-failed' () {
    api.get(`/repos/fake/stuff/labels/${label}`).reply(200, { name: label })

    api.get('/repos/fake/stuff/issues')
      .query({ 'labels': label, 'state': 'open' })
      .reply(200, [{ number: 999, labels: [] }])

    api.put('/repos/fake/stuff/pulls/999/merge')
      .reply(405, { 'message': 'Pull Request is not mergeable' })

    api.get('/repos/fake/stuff/labels/merge-failed').reply(404)

    api.post('/repos/fake/stuff/labels', {
      name: 'merge-failed',
      color: 'cc0000'
    }).reply(201, { name: 'merge-failed' })

    api.post('/repos/fake/stuff/issues/999/labels', { labels: ['merge-failed'] })
      .reply(200)

    api.post('/repos/fake/stuff/issues/999/comments', {
      body: 'Failed to automatically merge with error: **Pull Request is not mergeable**'
    }).reply(201)

    await fauxbot.trigger()
  }
}
