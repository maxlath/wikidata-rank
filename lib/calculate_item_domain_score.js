const split = require('split')
const batch = require('./batch')
const { buildOp, padScore } = require('./ops')
const status = require('./status')
const getIdsStream = require('./get_ids_stream')
const logAndExit = require('./log_and_exit')
const flushOnceAllReturned = require('./flush_once_all_returned')

const counters = { total: 0, returned: 0 }
var concurrent = 0

module.exports = params => {
  const { scoreDomain, networkScoreDomain, getScore } = params

  process.stdin
  .pipe(split())
  .on('data', function (id) {
    if (id === '') return

    concurrent += 1
    var paused = false

    if (concurrent > 1000) {
      this.pause()
      concurrent = 0
      paused = true
    }

    counters.total += 1
    getScore(id, networkScoreDomain)
    .then(putScore(scoreDomain, id))
    .then(() => {
      if (paused) this.resume()
      counters.returned += 1
    })
    .catch(logAndExit(`${scoreDomain} score: ${id}`))
  })
  .on('close', () => flushOnceAllReturned(counters))
  .on('error', logAndExit)
}

const putScore = (scoreDomain, id) => score => {
  batch.aggregate([
    buildOp(`${scoreDomain}:${id}`, score),
    buildOp(`${scoreDomain}:r:${padScore(score)}:${id}`)
  ])
  status.increment()
}
