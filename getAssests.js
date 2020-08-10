#!/usr/bin/env node

// Fetch the list of asset pairs available on the kraken exchange.
// asset_pairs.json is to be used for trades, asset_pairs_ws.json for orders.

const axios = require('axios')
const fs = require('fs')

axios
  .get('https://api.kraken.com/0/public/AssetPairs')
  .then((resp) => {
    const result = Object.keys(resp.data.result)
    if (result && result.length !== 0) {
      const wsnames = result.map(r => resp.data.result[r].wsname)
      fs.writeFileSync('asset_pairs.json', JSON.stringify(result))
      fs.writeFileSync('asset_pairs_ws.json', JSON.stringify(wsnames))
    } else {
      console.error('An error occurred, the server did not send back data.')
      console.error(resp.data.error)
    }
  })
  .catch((error) => {
    console.error('An error occurred when fetching new data.')
    console.error(error)
  })
