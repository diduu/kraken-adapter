const axios = require('axios')

const orders_url = 'https://api.kraken.com/0/public/Depth'
const trades_url = 'https://api.kraken.com/0/public/Trades'
const pair = 'ETHUSD'

async function getOrders() {
    try {
        const { data } = await axios.get(orders_url + `?pair=${pair}`)
        if (data.error && data.error.length !== 0) {
            console.error(data.error)
        }
        console.log(data.result)
    } catch (error) {
        console.error(error)
  }
}

getOrders()