// Ripped right off SO:
// https://stackoverflow.com/questions/23593052/format-javascript-date-to-yyyy-mm-dd
module.exports = function () {
  const d = new Date()
  let month = String(d.getMonth() + 1)
  let day = String(d.getDate())

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return `merge-${d.getFullYear()}-${month}-${day}`
}
