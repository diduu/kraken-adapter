const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')

async function apiCall (base_url, params) {
  const url = base_url + '?' + querystring.stringify(params)
  try {
    const { data } = await axios.get(url)
    if (data.error && data.error.length !== 0) {
      console.error('The server sent back one or more errors.')
      console.error(data.error)
    }
    if (data.result) { console.log(data.result) }
  } catch (error) {
    console.error('An error occurred when fetching data.')
    console.error(error)
  }
}

const orders_url = 'https://api.kraken.com/0/public/Depth'
const trades_url = 'https://api.kraken.com/0/public/Trades'
const pairs = ['XBTUSD'] // require('./asset_pairs.json')

Promise.all(pairs.map(pair => apiCall(orders_url, { pair: pair })))
Promise.all(pairs.map(pair => apiCall(trades_url, { pair: pair })))
