/*

https://bl.ocks.org/alandunning/4c36eb1abdb248de34c64f5672afd857
http://bl.ocks.org/nbremer/6506614
https://www.visualcinnamon.com/2013/09/making-d3-radar-chart-look-bit-better.html
http://bl.ocks.org/chrisrzhou/2421ac6541b68c1680f8

*/

/* eslint-disable */

import _ from 'lodash'
import * as fs from 'fs'
import path from 'path'

const data = fs.readFileSync(
  path.join(__dirname, '../output/aemet-data-1973-01-01_2017-10-01.csv'),
  { encoding: 'utf8' } 
).split('\n')

const keys = _.take(data, 1)
const values = _.drop(data, 1)

const testDataObject = values.filter(d => d.split(',')[0].split('-')[0] === '1973')

console.log(testDataObject)
