const { green, grey, blue } = require('chalk')
const pid = grey(`[${process.pid}]`)
var counter = 0

module.exports = {
  increment: () => {
    counter += 1
    if (counter % 10000 === 0) console.log(pid, blue(counter))
  },
  counter: () => counter,
  done: () => {
    console.log(pid, green('done'))
    console.log(pid, green(`entities total:`), counter)
  },
  pid
}
