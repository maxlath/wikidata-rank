const db = require('../lib/db')
const errors = require('./lib/errors')
const { isNonEmptyString, wrap } = require('./lib/utils')
const wdk = require('wikidata-sdk')
const domains = [ 'base', 'network', 'secondary' ]

module.exports = (req, res) => {
  var { ids } = req.query

  if (!isNonEmptyString(ids)) {
    return errors.bundle(res, 'missing ids in the query string', 400)
  }

  ids = ids.split('|')

  for (let id of ids) {
    if (!wdk.isItemId(id)) {
      return errors.bundle(res, `invalid item id: ${id}`, 400, { ids })
    }
  }

  ids = ids.map(id => `total:${id}`)

  db.fetch(ids, 'index')
  .then(formatScores)
  .then(res.json.bind(res))
  .catch(errors.Handle(res))
}

const formatScores = data => {
  const scores = {}
  var notFound = {}
  Object.keys(data).forEach(key => {
    const [ domain, id ] = key.split(':')
    const score = data[key]
    if (score == null) {
      notFound[id] = true
    } else {
      scores[id] = data[id] || {}
      scores[id][domain] = score
    }
  })
  notFound = Object.keys(notFound)
  return { scores, notFound }
}
