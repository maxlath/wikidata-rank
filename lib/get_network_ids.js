const db = require('./db')

module.exports = targetId => {
  return db.keyRange({
    gte: `link:${targetId}:Q`,
    lt: `link:${targetId}:R`
  })
  .then(keys => keys.map(parseKey))
}

const parseKey = key => key.split(':')[2]
