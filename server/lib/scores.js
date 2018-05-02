const _ = require('lodash')
const { domains } = require('../../lib/domains')

const formatScores = subscores => data => {
  const scores = {}
  var notFound = {}
  Object.keys(data).forEach(key => {
    const [ domain, id ] = key.split(':')
    const score = data[key]
    if (score == null) {
      notFound[id] = true
    } else if (subscores) {
      scores[id] = scores[id] || {}
      scores[id][domain] = score
    } else {
      scores[id] = score
    }
  })
  notFound = Object.keys(notFound)
  if (notFound.length === 0) notFound = null
  return { scores, notFound }
}

const domainId = domain => id => `${domain}:${id}`

const domainIdFns = domains.reduce((obj, domain) => {
  obj[domain] = domainId(domain)
  return obj
}, {})

const allDomainsIds = ids => {
  return _.flatten(domains.map(domain => ids.map(domainIdFns[domain])))
}

module.exports = { formatScores, domainIdFns, allDomainsIds }
