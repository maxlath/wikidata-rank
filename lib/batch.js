const db = require('./db')
const logAndExit = require('./log_and_exit')
const { green } = require('chalk')
const { pid } = require('./status')

var ops = []
var count = 0
var totalOps = 0

module.exports = {
  aggregate: (newOps, stream) => {
    if (newOps instanceof Array) {
      ops.push(...newOps)
    } else {
      ops.push(newOps)
    }

    // Aggregate operations before puting in batch
    if (ops.length < 10000) return

    count += 1

    const key = `batch ${count}`

    console.time(key)

    if (stream) stream.pause()

    totalOps += ops.length

    return db.batch(ops)
    .then(() => {
      ops = []
      if (stream) stream.resume()
      console.timeEnd(key)
    })
    .catch(logAndExit('aggregated batch'))
  },

  flush: () => {
    totalOps += ops.length
    return db.batch(ops)
    .then(() => {
      console.log(pid, green(`total key/value pairs added:`), totalOps)
    })
    .catch(logAndExit('flush batch'))
  }
}
