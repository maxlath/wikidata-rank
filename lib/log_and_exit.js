module.exports = label => err => {
  if (!err) return
  console.error(label, err)
  process.exit(1)
}
