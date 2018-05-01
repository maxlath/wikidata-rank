const _ = require('lodash')
const db = require('./db')

module.exports = id => {
  return db.keyRange({
    gte: `link:${id}:Q`,
    lt: `link:${id}:R`
  })
  .then(keys => {
    if (keys.length === 0) return 0

    const originIds = keys.map(key => key.split(':')[2])

    return Promise.all(originIds.map(getBaseScore))
    .then(_.sum)
    .then(total => _.round(total * 0.25, 2))
  })
}

const getBaseScore = id => db.get(`base:${id}`)
