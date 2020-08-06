const axios = require('axios')
const fs = require('fs')

axios
  .get('https://api.kraken.com/0/public/AssetPairs')
  .then((resp) => {
    const result = Object.keys(resp.data.result)
    if (result && result.length !== 0) {
      fs.writeFile('asset_pairs.json', JSON.stringify(result), (error) => {
        if (error) {
          console.error('An error occurred trying to write to file.')
          console.error(error)
        } else {
          console.log('Asset pairs correctly updated.')
        }
      })
    } else {
      console.error('An error occurred, the server did not send back data.')
      console.error(resp.data.error)
    }
  })
  .catch((error) => {
    console.error('An error occurred when fetching new data.')
    console.error(error)
  })