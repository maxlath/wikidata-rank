# Wikidata Rank

Attributing scores to Wikidata items, publishing those with a web API and dumps under a CC0 license.

## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Calculate scores](#calculate-scores)
  - [Base scores](#base-scores)
  - [Network scores](#network-scores)
  - [Secondary network scores](#secondary-network-scores)
  - [Total scores](#total-scores)
  - [All scores](#all-scores)
- [Web API](#web-api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```sh
git clone https://github.com/maxlath/wikidata-rank
cd wikidata-rank
```

## Calculate scores

### Base scores

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

### Network scores
> item network score = sum of the base scores of items linking to the item
```sh
./scripts/calculate_network_scores
```

### Secondary network scores
> item secondary network score = sum of the network scores of items linking to the item
```sh
./scripts/calculate_secondary_network_scores
```

### Total scores
> item total score = base score + network score * 0.25 + secondary network score * 0.1

```sh
./scripts/calculate_total_scores
```

### All scores
```sh
./scripts/calculate_all_scores dump.json
```

## Web API
```
GET /scores?ids=Q8027|Q1001|Q216092|Q79969
GET /scores?ids=Q8027|Q1001|Q216092|Q79969&subscores=true
```
