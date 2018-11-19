const split = require('split')
const batch = require('./batch')
const { buildOp, padScore } = require('./ops')
const status = require('./status')
const getIdsStream = require('./get_ids_stream')
const logAndExit = require('./log_and_exit')
const flushOnceAllReturned = require('./flush_once_all_returned')

const counters = { total: 0, returned: 0 }
var concurrent = 0

// Randomizing batch length so that workers don't all try to put
// at the same time
const batchLength = 1000 + Math.trunc(Math.random() * 1000)

module.exports = params => {
  const { scoreDomain, networkScoreDomain, getScore } = params

  process.stdin
  .pipe(split())
  .on('data', function (id) {
    if (id === '') return

    concurrent += 1
    var paused = false

    // We need to handle back presure from here
    // as we can't let the batch do it after the getScore promise return:
    // we might have got new ids in the meantime
    if (concurrent > batchLength) {
      this.pause()
      concurrent = 0
      paused = true
    }

    counters.total += 1

    // Due to the heavy read/write on LevelDB,
    // the load balacing doesn't really work here: only the level-party leader
    // uses its CPU intensively all the time, while the other processes
    // are mostly idle
    getScore(id, networkScoreDomain)
    .then(putScore(scoreDomain, id, paused))
    .then(() => {
      if (paused) this.resume()
      counters.returned += 1
    })
    .catch(logAndExit(`${scoreDomain} score: ${id}`))
  })
  .on('close', () => flushOnceAllReturned(counters))
  .on('error', logAndExit)
}

const putScore = (scoreDomain, id, paused) => score => {
  batch.aggregate({
    newOps: [
      buildOp(`${scoreDomain}:${id}`, score),
      buildOp(`${scoreDomain}:r:${padScore(score)}:${id}`)
    ],
    flush: paused
  })
  status.increment(`items ${scoreDomain} scores calcuated`)
}
