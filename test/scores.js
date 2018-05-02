require('should')
const { get, undesiredRes, undesiredErr } = require('./lib/utils')

describe('scores', function () {
  it('should reject missing ids', done => {
    get('/scores')
    .then(undesiredRes(done))
    .catch(err => {
      err.statusCode.should.equal(400)
      err.body.message.should.equal('missing ids in the query string')
      done()
    })
    .catch(undesiredErr(done))
  })

  it('should reject invalid ids', done => {
    get('/scores?ids=7777777777')
    .then(undesiredRes(done))
    .catch(err => {
      err.statusCode.should.equal(400)
      err.body.message.should.equal('invalid item id: 7777777777')
      done()
    })
    .catch(undesiredErr(done))
  })

  it('should return items scores', done => {
    get('/scores?ids=Q1001')
    .then(res => {
      res.statusCode.should.equal(200)
      res.body.scores.should.be.an.Object()
      res.body.scores.Q1001.should.be.an.Number()
      done()
    })
    .catch(undesiredErr(done))
  })

  it('should inform of ids not found', done => {
    get('/scores?ids=Q7777777777')
    .then(res => {
      res.statusCode.should.equal(200)
      res.body.notFound.should.deepEqual([ 'Q7777777777' ])
      done()
    })
    .catch(undesiredErr(done))
  })

  it('should return subscores if requested', done => {
    get('/scores?ids=Q1001&subscores=true')
    .then(res => {
      res.statusCode.should.equal(200)
      res.body.scores.should.be.an.Object()
      res.body.scores.Q1001.should.be.an.Object()
      res.body.scores.Q1001.base.should.be.an.Number()
      res.body.scores.Q1001.total.should.be.an.Number()
      res.body.coefficients.should.be.an.Object()
      res.body.coefficients.base.should.equal(1)
      done()
    })
    .catch(undesiredErr(done))
  })
})
