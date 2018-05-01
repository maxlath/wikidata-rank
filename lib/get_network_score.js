const _ = require('lodash')
const db = require('./db')
const getNetworkIds = require('./get_network_ids')

module.exports = domain => id => {
  return getNetworkIds(id)
  .then(originIds => {
    if (originIds.length === 0) return 0

    return Promise.all(originIds.map(id => db.get(`${domain}:${id}`)))
    .then(_.sum)
    .then(total => _.round(total, 2))
  })
}
