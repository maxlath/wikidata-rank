const db = require('./db')
const logAndExit = require('./log_and_exit')

var ops = []
var count = 0

module.exports = {
  aggregate: (newOps, stream) => {
    if (newOps instanceof Array) {
      ops.push(...newOps)
    } else {
      ops.push(newOps)
    }

    // Aggregate operations before puting in batch
    if (ops.length < 1000) return

    count += 1

    const key = `batch ${count}`

    console.time(key)

    if (stream) stream.pause()

    return db.batch(ops)
    .then(() => {
      ops = []
      if (stream) stream.resume()
      console.timeEnd(key)
    })
    .catch(logAndExit('aggregated batch'))
  },

  flush: () => {
    console.log('flush remaing ops:', ops.length)
    return db.batch(ops)
    .catch(logAndExit('flush batch'))
  }
}
