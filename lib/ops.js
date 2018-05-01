const buildOp = (key, value) => ({ type: 'put', key, value })
const padScore = score => Math.trunc(score).toString().padStart(10, '0')

module.exports = {
  padScore,
  buildOp,
  buildOpFromEntityData: (id, data) => {
    const ops = data.links.map(targetId => buildOp(`link:${targetId}:${id}`))
    ops.push(buildOp(`base:${id}`, data.score))
    ops.push(buildOp(`base:r:${padScore(data.score)}:${id}`))
    return ops
  }
}
