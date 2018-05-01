const db = require('./db')
const logAndExit = require('./log_and_exit')

var ops = []
var count = 0

module.exports = {
  aggregate: (stream, newOps) => {
    ops.push(...newOps)

    // Aggregate operations before puting in batch
    if (ops.length < 1000) return

    count += 1

    const key = `batch ${count}`

    console.time(key)

    stream.pause()

    return db.batch(ops)
    .then(() => {
      ops = []
      stream.resume()
      console.timeEnd(key)
    })
    .catch(logAndExit('aggregated batch'))
  },

  flush: () => {
    console.log('flush')
    return db.batch(ops)
    .catch(logAndExit('flush batch'))
  }
}
