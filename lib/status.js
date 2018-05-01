const { green, grey } = require('chalk')
var counter = 0

module.exports = {
  increment: () => {
    counter += 1
    if (counter % 10000 === 0) console.log(grey(counter))
  },
  counter: () => counter,
  done: () => {
    console.log(green('done'))
    console.log(green(`entities total:`), counter)
  }
}
