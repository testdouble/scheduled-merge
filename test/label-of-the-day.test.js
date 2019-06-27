const labelOfTheDay = require('../lib/label-of-the-day')

let label
module.exports = {
  beforeEach: function () {
    label = labelOfTheDay()
  },
  rendersLabel: function () {
    let today = new Date()
    let year = String(today.getFullYear())
    let month = String(today.getMonth() + 1)
    let day = String(today.getDate())
    let hour = String(today.getHours())

    if (month.length < 2) {
      month = '0' + month
    }

    if (day.length < 2) {
      day = '0' + day
    }

    if (hour.length < 2) {
      hour = '0' + hour
    }

    ought.equal(label, `merge-${year}-${month}-${day}-${hour}`)
  }
}
