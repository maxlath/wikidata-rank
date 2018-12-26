<!-- Centering -->
<div style="margin: 0 auto; width: 300px; text-align: center;" align="center">
  <img src="https://raw.githubusercontent.com/maxlath/wikidata-rank/master/assets/images/logo_sorted_square.png" width="300">
  <h1>Wikidata Rank</h1>
</div>

**Attributing scores to [Wikidata items](https://www.wikidata.org/wiki/Wikidata:Glossary#Item), making those available via a [web API](#web-api) and [dumps](#dumps), under a [CC0](https://creativecommons.org/publicdomain/zero/1.0/) license.**

**Motivation**: when re-using Wikidata data, it can be useful to be able to sort a bunch of items by some kind of score [[1](https://stackoverflow.com/questions/39438022/wikidata-results-sorted-by-something-similar-to-a-pagerank)], [[2](https://github.com/inventaire/inventaire/blob/1aaff2a/server/data/wikidata/queries/links_count.coffee)]. So instead of spamming query.wikidata.org with one SPARQL request per item, we pre-calculate a score for all items from a [Wikidata Dump](https://www.wikidata.org/wiki/Wikidata:Database_download#JSON_dumps_.28recommended.29), and serve them in bulk.

There are already pre-existing works on a [Wikidata Page Rank](http://people.aifb.kit.edu/ath/), but no API to cherry-pick items of interest, and the data isn't in CC0. Other motivations may include traces of just having fun with scoring algorithms.

* [Wikidata Rank page on Wikimedia Toolforge](https://toolsadmin.wikimedia.org/tools/id/wikidata-rank)
* [Source code](https://github.com/maxlath/wikidata-rank)

## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Web API](#web-api)
- [Dumps](#dumps)
- [Development setup](#development-setup)
  - [Dependencies](#dependencies)
  - [Install](#install)
  - [Calculate scores](#calculate-scores)
    - [Base scores](#base-scores)
    - [Network scores](#network-scores)
    - [Secondary network scores](#secondary-network-scores)
    - [Total scores](#total-scores)
    - [All scores](#all-scores)
- [Deploy](#deploy)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Web API
```
GET /scores?ids=Q8027|Q1001|Q216092|Q79969
GET /scores?ids=Q8027|Q1001|Q216092|Q79969&subscores=true
```

## Dumps
> *coming soon*


## Development setup

### Dependencies
* [NodeJS](https://nodejs.org) `>v6.4.0` (recommanded way to install: [NVM](https://github.com/creationix/nvm))

### Install
```sh
git clone https://github.com/maxlath/wikidata-rank
cd wikidata-rank
npm install
# Starts the server on port 7264 and watch for files changes to restart
npm run watch
```

At this point, your server is setup, but it has nothing to serve: we need to [populate the database with items scores](#calculate-scores)

### Calculate scores

#### Base scores

> item base score =
> number of labels<br>
> \+ number of descriptions * 0.5<br>
> \+ number of aliases * 0.25<br>
> \+ number of statements * 2<br>
> \+ number of qualifiers<br>
> \+ number of references<br>
> \+ number of sitelinks * 4

```sh
wget -c https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.gz
cat latest-all.json.gz | gzip -d | ./scripts/calculate_base_scores
```

#### Network scores
> item network score = sum of the base scores of items linking to the item

```sh
./scripts/calculate_network_scores
```

#### Secondary network scores
> item secondary network score = sum of the network scores of items linking to the item

```sh
./scripts/calculate_secondary_network_scores
```

#### Total scores
> item total score = base score + network score * 0.25 + secondary network score * 0.1

```sh
./scripts/calculate_total_scores
```

#### All scores
You can alternatively calculate all those scores at once:
```sh
./scripts/calculate_all_scores dump.json
```

## Deploy to Toolforge
See the [`Hub` deploy doc](https://github.com/maxlath/hub/blob/master/docs/deploy.md), simply replacing `hub` by `wd-rank`, especially on step 4:
```sh
echo "module.exports = {
  host: 'https://tools.wmflabs.org',
  // Customize root to match the URL passed by Nginx
  root: '/wd-rank'
}" > config/local.js
```

### install NodeJS with NVM
We can't access wikidata entities dump at `/mnt/nfs/dumps-labstore1006.wikimedia.org/xmldatadumps/public/wikidatawiki/entities/latest-all.json.gz` from the NodeJS webservice (see [Phabricator ticket T193646](https://phabricator.wikimedia.org/T193646)), so a work-around is to install our own NodeJS using [NVM](https://github.com/creationix/nvm):
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
. $HOME/.nvm/nvm.sh
# Use the same version as `webservice --backend=kubernetes nodejs shell`
nvm install 6.11.0
```

### run with custom NodeJS
`npm` operations still need to be done from the webservice I can't find a way to make the environment take that new node binary into account rather that `/usr/bin/node`
```sh
webservice --backend=kubernetes nodejs shell
cd ~/www/js
npm install
exit
```
```sh
# Force the use of our custom node binary
sed -i 's@node "./scripts@~/.nvm/versions/node/v6.11.0/bin/node "./scripts@' ./scripts/calculate_all_scores
./scripts/calculate_all_scores
```

### run as a job on Toolforge
See [Toolforge Grid doc](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Grid)
```sh
JOB_ID=$(jsub -mem 2048m ./scripts/run_calculate_all_scores | tee /dev/tty | sed -E 's/.* ([0-9]+) .*/\1/')
# See job info
qstat -j $JOB_ID
# Follow the logs
tail -f ./run_calculate_all_scores*
```
