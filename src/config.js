import moment from 'moment'
import commandLineArgs from 'command-line-args'

const argsDefinitions = [
  { name: 'start', alias: 's', type: String },
  { name: 'end', alias: 'e', type: String },
  { name: 'dateformat', alias: 'd', type: String },
  { name: 'apikey', alias: 'a', type: String },
  { name: 'meteostation', alias: 'm', type: String }
]

const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqamNlcmVyb0BpZGVhbC5lcyIsImp0aSI6Ijg2NTZiOWFmLWVmM2UtNGI1YS04OTU0LTBmNzBkZTE1ZmUzZCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNTA3OTEwMTIxLCJ1c2VySWQiOiI4NjU2YjlhZi1lZjNlLTRiNWEtODk1NC0wZjcwZGUxNWZlM2QiLCJyb2xlIjoiIn0.XnlDwKo8uQEwwl1S3XnQ5BzWUrs5XnP-uGMn4_Rb0iA'
const DATE_FORMAT = 'DD/MM/YYYY'
const args = commandLineArgs(argsDefinitions)

moment.locale('es')

export default {
  apiKey: args.apikey ? args.apikey : API_KEY,
  baseUrl: 'https://opendata.aemet.es/opendata/api/valores/climatologicos/diarios/datos/fechaini',
  station: args.meteostation ? args.meteostation : '5530E',
  startDate: args.start ? moment(args.start, DATE_FORMAT) : moment('01/10/2017', DATE_FORMAT),
  endDate: args.end ? moment(args.end, DATE_FORMAT) : moment('17/10/2017', DATE_FORMAT),
  dateFormat: args.dateformat ? args.dateformat : DATE_FORMAT,
  requestOptions: {
    rejectUnauthorized: false,
    qs: {
      'api_key': args.apikey ? args.apikey : API_KEY
    },
    headers: {
      'cache-control': 'no-cache'
    }
  },
  fields: [],
  waitAmount: 3000
}
