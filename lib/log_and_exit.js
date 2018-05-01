module.exports = label => err => {
  console.error(label, err)
  process.exit(1)
}
