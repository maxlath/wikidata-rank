var turn = 0

module.exports = {
  roundRobinBalanceLine: children => line => {
    var nextChildren = children[turn]
    if (nextChildren) {
      turn += 1
    } else {
      nextChildren = children[0]
      turn = 1
    }
    nextChildren.stdin.write(line + '\n')
  },

  closeChildren: children => () => {
    children.forEach(child => child.stdin.end())
  },

  exitOnChildExit: exitCode => {
    // Wait a bit for other children to have a chance to exit themselves
    // before the parent calls the end
    setTimeout(() => {
      if (exitCode !== 0) process.exit(exitCode)
    }, 500)
  }
}
