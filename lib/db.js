global.Promise = require('bluebird')

const level = require('level-party')
const db = level('./db', {
  valueEncoding: 'json',
  cacheSize: 512 * 1024 * 1024
})

const keyRange = options => {
  const keys = []
  return new Promise((resolve, reject) => {
    db.createKeyStream(options)
    .on('data', keys.push.bind(keys))
    .on('close', () => resolve(keys))
    .on('error', reject)
  })
}

const promisify = fnName => Promise.promisify(db[fnName], { context: db })

module.exports = {
  // Promisifying the db methods instead of using levelup promise interface
  // as level-party and its dependencies like multileveldown weren't updated
  // to levelup >= 2.0.0, and thus do not return promises
  get: promisify('get'),
  put: promisify('put'),
  batch: promisify('batch'),
  createKeyStream: db.createKeyStream.bind(db),
  keyRange
}
