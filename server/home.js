module.exports = publicFileRoot => (req, res) => {
  res.sendFile(publicFileRoot + 'index.html')
}
