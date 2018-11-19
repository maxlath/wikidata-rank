const wdk = require('wikidata-sdk')
const _ = require('lodash')
const properties = require('../properties.json')
const { red, yellow, grey } = require('chalk')

const simplificationOptions = {
  keepQualifiers: true,
  keepReferences: true,
  // Considering that non-truthy data are still of value
  // and a sign of the popularity of an entity
  keepNonTruthy: true
}

module.exports = entity => {
  var score = 0
  score += singleValuePerKeyCount(entity.labels)
  score += singleValuePerKeyCount(entity.descriptions) * 0.5
  score += severalValuesPerKeyCount(entity.aliases) * 0.25
  score += singleValuePerKeyCount(entity.sitelinks) * 4

  const claims = wdk.simplify.claims(entity.claims, simplificationOptions)

  const claimsData = getClaimsData(claims)
  score += claimsData.statements * 2
  score += claimsData.qualifiers * 0.5
  score += claimsData.references * 0.5

  return {
    score: Math.round(score),
    links: claimsData.links
  }
}

const singleValuePerKeyCount = obj => Object.keys(obj).length
const severalValuesPerKeyCount = aliases => _.flatten(_.values(aliases)).length

const getClaimsData = claims => {
  const data = { links: [], statements: 0, qualifiers: 0, references: 0 }

  try {
    Object.keys(claims).forEach(addPropertyClaimsData(data, claims))
  } catch (err) {
    // Prevent crashing the process, simply output the data
    // as far as we got
    // Known case: items with delete/invalid properties
    // Ex: https://www.wikidata.org/w/index.php?title=Q2105758&oldid=630350590
    console.error(red(err.stack))
  }

  return data
}

const loggedNotFoundProperties = {}

const addPropertyClaimsData = (data, claims) => property => {
  if (!properties[property]) return logNotFoundPropertyOnce(property)
  const isItemProperty = properties[property].type === 'WikibaseItem'
  const statements = claims[property]
  data.statements += statements.length
  statements.forEach(statement => {
    if (isItemProperty) data.links.push(statement.value)
    data.qualifiers += severalValuesPerKeyCount(statement.qualifiers)
    data.references += statement.references.length
  })
}

// Will log missing properties once per process
// TODO: find a way to share the loggedNotFoundProperties object among processes
const logNotFoundPropertyOnce = property => {
  if (!knownMissingProperties.includes(property) && !loggedNotFoundProperties[property]) {
    console.warn(yellow('property not found, ignoring'), property)
    console.warn(grey('possible reasons: outdated properties.json (run `npm run update-properties` to fix that) or outdated dump file'))
    loggedNotFoundProperties[property] = true
  }
}

const knownMissingProperties = [
  'P883',
  'P1222',
  'P1962',
  'P2237',
  'P5100'
]
