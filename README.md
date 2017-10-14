# What is this?
A Node.js program that programatically gets data from Agencia Estatal de Meteorología (Aemet) for any given station in Spain between any two dates. 

# Before you use

You're going to need your own API key (Aemet keys expire **every 5 days**). You can do so visiting [this URL](https://opendata.aemet.es/centrodedescargas/altaUsuario).

You also need the code of the station you want to query. You can get this code making a test request using [Aemet's own frontend for their API](https://opendata.aemet.es/centrodedescargas/productosAEMET).

(Look for *Valores climatológicos > Climatologías diarias*, after you select a province you'll see the codes for all of the available stations).

# How to use

## Getting Data
Edit `src/config.js` and change the default values set in the exported object.

You can edit variables for:
  - start date (`startDate`)
  - end date (`endDate`)
  - meteo station (`station`)
  - api key (`apiKey`)
  - wait time between reqs (`waitAmount`). It's not recommended that you set it under **3000ms** unless you're requesting a very small amount of elements, because the API request limit will be hit and the program will halt.  

Run 
- **`yarn && yarn start`** 
- or
- **`npm install && npm run start`**

Data is exported as a csv file by default to an `output/` folder.

# Known Issues
Currently, the Aemet REST service offers data up to three days before the current date. This is expected behaviour. You can read more about this issue [here](https://opendata.aemet.es/centrodedescargas/docs/FAQs130917.pdf).

# More Information
All the data comes from Aemet's public REST API. You can read everything about this API [here](https://opendata.aemet.es/centrodedescargas/inicio).

# TODO
- Write to output file in an async way using node streams so as to not overdo RAM usage
- Implement true usage of command line arguments
- Manage error messages and statuses better
- Process raw csv data based on user preferences object
- Generate radar charts using nivo test app
- Alternatively, generate visualization using d3.v4

# Have any questions?

Send me an email at *jjcerero AT ideal DOT es* and I'll see what I can do.
