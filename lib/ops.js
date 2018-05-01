const build = (key, value) => ({ type: 'put', key, value })

module.exports = {
  build,
  fromEntityData: (id, data) => {
    const ops = data.links.map(targetId => build(`link:${targetId}:${id}`))
    ops.push(build(`base:${id}`, data.score))
    return ops
  }
}
