const axios = require('axios')
const querystring = require('querystring')

async function apiCall (baseUrl, params) {
  const url = baseUrl + '?' + querystring.stringify(params)
  try {
    const { data } = await axios.get(url)
    if (data.error && data.error.length !== 0) {
      console.error(data.error)
    }
    if (data.result) { console.log(data.result) }
  } catch (error) {
    console.error(error)
  }
}

const ordersUrl = 'https://api.kraken.com/0/public/Depth'
const tradesUrl = 'https://api.kraken.com/0/public/Trades'
const pairs = ['ETHUSD', 'XBTUSD']

Promise.all(pairs.map(pair => apiCall(ordersUrl, { pair: pair })))
Promise.all(pairs.map(pair => apiCall(tradesUrl, {
  pair: pair,
  since: '1596669235354531793'
})))
