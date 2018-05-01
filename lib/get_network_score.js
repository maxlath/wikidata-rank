const _ = require('lodash')
const db = require('./db')
const getNetworkIds = require('./get_network_ids')

module.exports = domain => id => {
  return getNetworkIds(id)
  .then(originIds => {
    if (originIds.length === 0) return 0

    const keys = originIds.map(key => `${domain}:${id}`)

    return db.fetch(keys)
    .then(_.sum)
    .then(total => {
      if (typeof total !== 'number') {
        throw new Error(`type error: ${domain}/${id}/${total}`)
      }
      return _.round(total, 2)
    })
  })
}
