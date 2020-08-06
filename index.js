const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')

async function apiCall (baseUrl, params) {
  const url = baseUrl + '?' + querystring.stringify(params)
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

const ordersUrl = 'https://api.kraken.com/0/public/Depth'
const tradesUrl = 'https://api.kraken.com/0/public/Trades'
const pairs = require('./asset_pairs.json')

Promise.all(pairs.map(pair => apiCall(ordersUrl, { pair: pair })))
Promise.all(pairs.map(pair => apiCall(tradesUrl, { pair: pair })))
