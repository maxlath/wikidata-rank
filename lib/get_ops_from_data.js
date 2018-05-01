module.exports = (id, data) => {
  const ops = data.links.map(targetId => buildOp(`link:${targetId}:${id}`))
  ops.push(buildOp(`base:${id}`, data.score))
  return ops
}

const buildOp = (key, value) => ({ type: 'put', key, value })
