const logAndExit = require('./log_and_exit')

const level = require('level')
const db = level('./db', { valueEncoding: 'json' })
// Customizing LevelDown
// see https://github.com/Level/leveldown#options
db.db.open({ cacheSize: 512 * 1024 * 1024 }, logAndExit('leveldown open'))

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
