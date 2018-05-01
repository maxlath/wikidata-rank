const through = require('through')
const db = require('./db')

module.exports = () => {
  return db.createKeyStream({
    gte: 'base:Q',
    lt: 'base:R'
  })
  .pipe(through(function (key) {
    this.queue(key.replace('base:', ''))
  }))
}
