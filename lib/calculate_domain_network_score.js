#!/usr/bin/env node
const db = require('./db')
const batch = require('./batch')
const ops = require('./ops')
const status = require('./status')
const getIdsStream = require('./get_ids_stream')
const getNetworkScore = require('./get_network_score')
const logAndExit = require('./log_and_exit')
const flushOnceAllReturned = require('./flush_once_all_returned')

const counters = { total: 0, returned: 0 }
var concurrent = 0

module.exports = params => {
  const { scoreDomain, networkScoreDomain } = params
  getIdsStream()
  .on('data', function (id) {
    concurrent += 1
    var paused = false

    if (concurrent > 1000) {
      this.pause()
      concurrent = 0
      paused = true
    }

    counters.total += 1
    getNetworkScore(id, networkScoreDomain)
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
  batch.aggregate(ops.build(`${scoreDomain}:${id}`, score))
  status.increment()
}
