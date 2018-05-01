const batch = require('./batch')
const status = require('./status')

const flushOnceAllReturned = counters => {
  const { total, returned } = counters
  if (returned === total) {
    console.log('all previous ops are done')
    batch.flush()
    .then(status.done)
  } else {
    const remaining = total - returned
    console.log('waiting for previous ops to be done', { total, remaining })
    setTimeout(flushOnceAllReturned.bind(null, counters), 100)
  }
}

module.exports = flushOnceAllReturned
