const db = require('../lib/db')
const errors = require('./lib/errors')
const { isNonEmptyString } = require('./lib/utils')
const wdk = require('wikidata-sdk')
const { coefficients } = require('../lib/domains')
const { formatScores, domainIdFns, allDomainsIds } = require('./lib/scores')

module.exports = (req, res) => {
  var { ids, subscores } = req.query

  if (!isNonEmptyString(ids)) {
    return errors.bundle(res, 'missing ids in the query string', 400)
  }

  ids = ids.split('|')

  for (let id of ids) {
    if (!wdk.isItemId(id)) {
      return errors.bundle(res, `invalid item id: ${id}`, 400, { ids })
    }
  }

  subscores = subscores === 'true'

  if (subscores) {
    ids = allDomainsIds(ids)
  } else {
    ids = ids.map(domainIdFns.total)
  }

  db.fetch(ids, 'index')
  .then(formatScores(subscores))
  .then(data => {
    if (subscores) data.coefficients = coefficients
    res.json(data)
  })
  .catch(errors.Handle(res))
}
