const logger = require('inv-loggers')

logger.warn = (err, label) => {
  var obj
  if (err.headers) {
    const res = err
    const { headers, body, statusCode } = res
    obj = { headers, body, statusCode }
  } else {
    const { message, context } = err
    label = label || message
    const stackLength = err.statusCode < 500 ? 3 : 50
    const emitter = getEmitter(err.stack, message, stackLength)
    obj = { message, context, emitter }
  }
  logger.log(obj, label, 'yellow')
}

const getEmitter = (stack, message, length) => {
  if (!stack) return
  return stack.split('\n')
  .filter(line => {
    return !(/\/errors.js:/.test(line) || line.match(message))
  })
  .slice(0, length)
  .map(line => line.trim())
}

module.exports = logger
