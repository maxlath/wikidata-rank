const level = require('level')
const db = level('./db', { valueEncoding: 'json' })

db.keyRange = options => {
  const keys = []
  return new Promise((resolve, reject) => {
    db.createKeyStream(options)
    .on('data', keys.push.bind(keys))
    .on('close', () => resolve(keys))
    .on('error', reject)
  })
}

module.exports = db
