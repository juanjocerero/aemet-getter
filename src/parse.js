/*

https://bl.ocks.org/alandunning/4c36eb1abdb248de34c64f5672afd857
http://bl.ocks.org/nbremer/6506614
https://www.visualcinnamon.com/2013/09/making-d3-radar-chart-look-bit-better.html
http://bl.ocks.org/chrisrzhou/2421ac6541b68c1680f8

*/

/* eslint-disable */
import moment from 'moment'
import _ from 'lodash'
import parse from 'csv-parse/lib/sync'
import * as fs from 'fs'
import path from 'path'
import * as stats from 'd3-array'

moment.locale('es')

const csv = () => fs.readFileSync(
  path.join(__dirname, '../output/aemet-data-1973-01-01_2017-10-01.csv'),
  { encoding: 'utf8' }
)

const asObjectArray = csv => parse(csv, { auto_parse: true, columns: true })

const mutate = data => data.map(d => ({
  date: moment(d.fecha, 'YYYY-MM-DD'),
  date_string: d.fecha,
  year: +d.fecha.split('-')[0],
  month: moment.months((+d.fecha.split('-')[1]) - 1),
  day: +d.fecha.split('-')[2],
  tmed: +d.tmed,
  tmin: +d.tmin,
  tmax: +d.tmax,
  rain: +d.prec,
  station: `${d.nombre} (${d.provincia})`.toLocaleLowerCase()
}))

const groupByYear = data => _.groupBy(data, 'year')

const groupByMonth = data => {
  let obj = {}
  _.forOwn(data, (value, key) => obj[key] = _.groupBy(value, 'month'))
  return obj
}

const dataByMonth = groupByMonth(groupByYear(mutate(asObjectArray(csv()))))

// _.forOwn(data, (yearData, year) => {
//   _.forOwn(yearData, (days, month) => {
//     console.log(`y: ${year}, m: ${month}, d: ${days.length}, avg_tmax: ${stats.mean(days.map(d => d.tmax)).toFixed(2)}`)
//   })
// })

const data = mutate(asObjectArray(csv()))

console.log(data.filter(d => d.rain > 1 && d.year ===  2017).length)
