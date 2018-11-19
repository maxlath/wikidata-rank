const _ = require('lodash')
const db = require('./db')
const getNetworkIds = require('./get_network_ids')

module.exports = domain => id => {
  return getNetworkIds(id)
  .then(originIds => {
    if (originIds.length === 0) return 0

    const keys = originIds.map(key => `${domain}:${id}`)

    let total = 0

    const sumScoresSequentially = () => {
      const nextKey = keys.shift()
      if (!nextKey) return total

      return db.get(nextKey)
      .then(score => { total += score })
      .then(sumScoresSequentially)
    }

    // Get keys sequentially so that largest networks do not crash the process by triggering
    // huge amounts of promises at once
    return sumScoresSequentially()
    .then(total => {
      if (typeof total !== 'number') {
        throw new Error(`type error: ${domain}/${id}/${total}`)
      }
      return Math.round(total)
    })
  })
}
