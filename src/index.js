import moment from 'moment'
import rq from 'request-promise'
import stringify from 'csv-stringify'
import commandLineArgs from 'command-line-args'
import _ from 'lodash'
import * as fs from 'fs'
import { promisify } from 'util'
import path from 'path'

const argsDefinitions = [
  { name: 'start', alias: 's', type: String },
  { name: 'end', alias: 'e', type: String },
  { name: 'dateformat', alias: 'd', type: String },
  { name: 'apikey', alias: 'a', type: String }
]

const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqamNlcmVyb0BpZGVhbC5lcyIsImp0aSI6Ijg2NTZiOWFmLWVmM2UtNGI1YS04OTU0LTBmNzBkZTE1ZmUzZCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNTA3OTEwMTIxLCJ1c2VySWQiOiI4NjU2YjlhZi1lZjNlLTRiNWEtODk1NC0wZjcwZGUxNWZlM2QiLCJyb2xlIjoiIn0.XnlDwKo8uQEwwl1S3XnQ5BzWUrs5XnP-uGMn4_Rb0iA'
const DATE_FORMAT = 'DD/MM/YYYY'
const args = commandLineArgs(argsDefinitions)
const setTimeoutPromise = promisify(setTimeout)

const state = {
  apiKey: args.apikey || API_KEY,
  baseUrl: 'https://opendata.aemet.es/opendata/api/valores/climatologicos/diarios/datos/fechaini',
  station: '5530E',
  startDate: args.start ? moment(args.start, DATE_FORMAT) : moment('01/01/1973', DATE_FORMAT),
  endDate: args.end ? moment(args.end, DATE_FORMAT) : moment('01/07/1973', DATE_FORMAT),
  dateFormat: args.dateformat || DATE_FORMAT,
  requestOptions: {
    rejectUnauthorized: false,
    qs: {
      'api_key': args.apikey || API_KEY
    },
    headers: {
      'cache-control': 'no-cache'
    }
  },
  fields: [],
  waitAmount: 3000
}

const getMoment = date => moment(date, state.dateFormat)

const getFormattedMoment = (date, type = 'start') =>
  date.format()
    .split('+')[0]
    .replace('00:00:00', type === 'start' ? '00:00:00' : '23:59:59')
    .concat('UTC').toString()

const getUrlString = (
  now,
  nextEndDate,
  baseUrl = state.baseUrl,
  station = state.station
) => `${baseUrl}/${escape(getFormattedMoment(now))}/fechafin/${escape(getFormattedMoment(nextEndDate, 'end'))}/estacion/${station}`.trim()

const setCsvFields = metadataUrl => {
  rq(metadataUrl, { rejectUnauthorized: false })
    .then(response => {
      state.fields = JSON.parse(response).campos.map(c => c.id)
    })
}

const save = (data, accum) => new Promise((resolve, reject) => {
  if (data.length > 0) {
    resolve(accum.concat(
      data.map(d => {
        Object.keys(d).forEach(k => {
          d[k] = d[k].replace(',', '.')
          if (d[k].indexOf('.') !== -1) {
            d[k] = +d[k]
          }
        })
        return d
      })
    ))
  } else {
    reject('No data present')
  }
})

const isNextIterationLast = start => getMoment(state.endDate).diff(start, 'months') < 1

const moreThanOneMonth = (start, end) => end.diff(start, 'months') > 1

const getDataBetween = (start, end, accum) => {
  
  let actualEnd = moreThanOneMonth(start, end) ? start.clone().add(1, 'months') : end
  
  // eslint-disable-next-line no-console
  console.log(`Requesting data between ${start.format(state.dateFormat)} and ${end.format(state.dateFormat)} [${accum.length} elems]`)

  rq(getUrlString(start, actualEnd), state.requestOptions)
    .then(response => {
      if (state.fields.length === 0) {
        setCsvFields(JSON.parse(response).metadatos)
      }
      rq(JSON.parse(response).datos, { rejectUnauthorized: false })
        .then(data => save(JSON.parse(data), accum))
        .then(accum => {
          if (!isNextIterationLast(start.clone().add(1, 'months'))) {
            setTimeoutPromise(state.waitAmount)
              .then(() => {
                getDataBetween(
                  start.clone().add(1, 'months'),
                  actualEnd.clone().add(1, 'months'), 
                  accum
                )})
          } else {
            exportAsCsv(
              [state.fields.join(',')]
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
          `./../output/aemet-data-${state.startDate.format().split('T')[0]}_${state.endDate.format().split('T')[0]}.csv`
        ),
        output
      )
    } catch (error) {
      throw new Error(error)
    }
  })
}

moment.locale('es')
getDataBetween(state.startDate, state.endDate, [])
