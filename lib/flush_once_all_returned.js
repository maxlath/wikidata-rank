const batch = require('./batch')
const status = require('./status')
const { pid } = status

const flushOnceAllReturned = counters => {
  const { total, returned } = counters
  if (returned === total) {
    batch.flush()
    .then(status.done)
  } else {
    const remaining = total - returned
    setTimeout(flushOnceAllReturned.bind(null, counters), 100)
  }
}

module.exports = flushOnceAllReturned
