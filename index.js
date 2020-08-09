#!/usr/bin/env node

// https://www.kraken.com/fr-fr/features/api#get-recent-trades

const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')

async function apiCall (base_url, params) {
  const url = base_url + '?' + querystring.stringify(params)
  const { data } = await axios.get(url)

  if (data.error && data.error.length !== 0) {
    console.error('The server sent back one or more errors.')
    console.error(data.error)
  }

  if (data.result) {
    return data.result
  } else {
    throw new Error('No data was sent.')
  }
}

async function getTrades (pair, since, trades=[]) {
  const TRADES_URL = 'https://api.kraken.com/0/public/Trades'

  try {
    const resp = await apiCall(TRADES_URL, { pair: pair, since: since })
    const last = resp.last
    delete resp.last
    new_trades = resp[Object.keys(resp)[0]]
    const merged = [...trades, ...new_trades]
    
    if (last !== since) {
      return await getTrades(pair, last, merged)
    } else {
      return [ pair, last, merged ]
    }
  } catch (error) {
    console.error('An error occurred when fetching data.')
    console.error(error)
    return [ pair, since, trades ]
  }
}

function logOutput ([pair, last, trades]) {
  console.log(`Output for ${pair}`)
  console.log(`Last: ${last}`)
  console.log(trades)
}

function writeOutput ([pair, last, trades]) {
  const last_fn = './last.json'
  const ids = fs.existsSync(last_fn)
    ? JSON.parse(fs.readFileSync(last_fn))
    : {}

  ids[pair] = last
  fs.writeFileSync(last_fn, JSON.stringify(ids))

  const trades_fn = `./${pair}.json`
  const old_trades = fs.existsSync(trades_fn)
    ? JSON.parse(fs.readFileSync(trades_fn))
    : []

  const new_trades = [...new Set([...old_trades, ...trades])]
  fs.writeFileSync(trades_fn, JSON.stringify(new_trades))
}


const pairs = ['XBTUSD', 'ETHUSD'] // require('./asset_pairs.json')

const argv = process.argv.slice(1)
let name = argv[0].split('/')
name = name[name.length - 1]
const usage = `Usage: ${name} (log|write)`

if (argv.length !== 2) {
  console.log(usage)
  process.exit(1)
}

let output_function
switch (argv[1]) {
  case 'log':
    output_function = logOutput
    break
  case 'write':
    output_function = writeOutput
    break
  default:
  console.log(usage)
  process.exit(1)
}

Promise.all(pairs.map(pair => getTrades(pair, '')))
  .then(results => results.forEach(result => output_function(result)))
  .catch(e => console.error(e))
