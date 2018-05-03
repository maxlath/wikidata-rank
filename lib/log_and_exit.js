const { pid } = require('./status')

module.exports = label => err => {
  if (!err) return
  console.error(pid, label, err)
  process.exit(1)
}
