const pad = s => '00'.substring(s.length) + s

module.exports = function () {
  const d = new Date()
  let year = d.getFullYear()
  let month = String(d.getMonth() + 1)
  let day = String(d.getDate())
  let hour = String(d.getHours())

  return `merge-${year}-${pad(month)}-${pad(day)}-${pad(hour)}`
}
