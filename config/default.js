module.exports = {
  host: 'http://localhost:7264',
  name: 'wd-hack',
  port: 7264,
  root: '',
  base: function () {
    return this.host + this.root
  },
  metadata: {
    name: 'Wikidata Rank',
    title: 'Wikidata Rank',
    description: ''
  }
}
