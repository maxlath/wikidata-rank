const { green, grey, blue } = require('chalk')
const pid = grey(`[${process.pid}]`)
var counter = 0

module.exports = {
  increment: label => {
    counter += 1
    const timestamp = new Date().toISOString()
    if (counter % 10000 === 0) console.log(pid, grey(timestamp), blue(label), counter)
  },
  counter: () => counter,
  done: () => {
    console.log(pid, green('done'))
    console.log(pid, green(`entities total:`), counter)
  },
  pid
}
