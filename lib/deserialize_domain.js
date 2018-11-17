const fs = require('fs')

module.exports = domain => {
  const serializedData = fs.readFileSync(`./scripts/assets/${domain}`).toString()
  return Uint32Array.from(eval(serializedData))
}
