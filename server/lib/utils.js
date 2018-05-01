module.exports = {
  isNonEmptyString: str => typeof str === 'string' && str.length > 0,
  wrap: (res, attribute) => value => {
    const data = {}
    data[attribute] = value
    res.json(data)
  }
}
