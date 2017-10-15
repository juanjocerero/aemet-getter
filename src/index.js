import moment from 'moment'
import rq from 'request-promise'
import stringify from 'csv-stringify'
import _ from 'lodash'
import { promisify } from 'util'
import * as fs from 'fs'
import path from 'path'

import config from './config'

const setTimeoutPromise = promisify(setTimeout)

const getMoment = date => moment(date, config.dateFormat)

const getFormattedMoment = (date, type = 'start') =>
  date.format()
    .split('+')[0]
    .replace('00:00:00', type === 'start' ? '00:00:00' : '23:59:59')
    .concat('UTC').toString()

const getUrlString = (
  now,
  nextEndDate,
  baseUrl = config.baseUrl,
  station = config.station
) => `${baseUrl}/${escape(getFormattedMoment(now))}/fechafin/${escape(getFormattedMoment(nextEndDate, 'end'))}/estacion/${station}`.trim()

const setCsvFields = metadataUrl => {
  rq(metadataUrl, { rejectUnauthorized: false })
    .then(response => {
      config.fields = JSON.parse(response).campos.map(c => c.id)
    })
}

const save = (data, accum) => new Promise((resolve, reject) => {
  if (data.length > 0) {
    resolve(accum.concat(
      data.map(d => {
        Object.keys(d).forEach(k => {
          d[k].replace(',', '.').indexOf('.') !== -1 ? 
            d[k] = +d[k].replace(',', '.') : 
            d[k] = d[k].replace(',', '.')
        })
        return d
      })
    ))
  } else {
    reject('No data present')
  }
})

const isNextIterationLast = start => getMoment(config.endDate).diff(start, 'months') < 1

const moreThanOneMonth = (start, end) => end.diff(start, 'months') > 1

const getDataBetween = (start, end, accum) => {
  
  let actualEnd = moreThanOneMonth(start, end) ? start.clone().add(1, 'months') : end
  
  // eslint-disable-next-line no-console
  console.log(`Requesting data between ${start.format(config.dateFormat)} and ${end.format(config.dateFormat)} [${accum.length} elems]`)

  rq(getUrlString(start, actualEnd), config.requestOptions)
    .then(response => {
      if (config.fields.length === 0) {
        setCsvFields(JSON.parse(response).metadatos)
      }
      rq(JSON.parse(response).datos, { rejectUnauthorized: false })
        .then(data => save(JSON.parse(data), accum))
        .then(accum => {
          if (!isNextIterationLast(start.clone().add(1, 'months'))) {
            setTimeoutPromise(config.waitAmount)
              .then(() => {
                getDataBetween(
                  start.clone().add(1, 'months'),
                  actualEnd.clone().add(1, 'months'), 
                  accum
                )})
          } else {
            exportAsCsv(
              [config.fields.join(',')]
                .concat('\n')
                .concat(_.uniqBy(accum, JSON.stringify))
            )
          }
        })
    })
    .catch(error => {
      throw new Error(error)
    })
}

const exportAsCsv = data => {
  stringify(data, (error, output) => {
    if (error) {
      throw new Error(error)
    }
    try {
      fs.writeFileSync(
        path.join(
          __dirname, 
          `./../output/aemet-data-${config.startDate.format().split('T')[0]}_${config.endDate.format().split('T')[0]}.csv`
        ),
        output
      )
    } catch (error) {
      throw new Error(error)
    }
  })
}

moment.locale('es')
getDataBetween(config.startDate, config.endDate, [])
