#!/usr/bin/env node

// Order book monitor for the kraken exchange
// Usage: ./order_book.js symbol depth

// Most of the functions in this file are changing the format of the received data.
// They are adapted from the python example the exchange provided.
// Check the links below if you want to understand how we use the api here.
// https://support.kraken.com/hc/en-us/articles/360027821131-How-to-maintain-a-valid-order-book-
// https://support.kraken.com/hc/en-us/articles/360027677512-Example-order-book-code-Python-2-

const W3CWebSocket = require('websocket').w3cwebsocket
const fs = require('fs')

function api_output_book () {
  const file_name = api_symbol.replace('/', '')
  if (!fs.existsSync('./orders/')) { fs.mkdirSync('orders') }
  fs.writeFileSync(`orders/${file_name}.json`, JSON.stringify(api_book))
}

function api_update_book (side, data) {
  for (const x of data) {
    const price_level = x[0]
    if (parseFloat(x[1]) !== 0.0) {
      api_book[side][price_level] = parseFloat(x[1])
    } else {
      if (price_level in api_book[side]) {
        delete api_book[side].price_level
      }
    }
  }

  if (side === 'bid') {
    api_book.bid = Object.fromEntries(
      Object.entries(api_book.bid)
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .slice(0, parseInt(api_depth))
    )
  } else if (side === 'ask') {
    api_book.ask = Object.fromEntries(
      Object.entries(api_book.ask)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .slice(0, parseInt(api_depth))
    )
  }
}

const argv = process.argv.slice(1)
let name = argv[0].split('/')
name = name[name.length - 1]

if (argv.length < 3) {
  console.log(`Usage: ${name} symbol depth`)
  console.log(`Example: ${name} xbt/usd 10`)
  process.exit(1)
}

const api_feed = 'book'
const api_symbol = argv[1].toUpperCase()
const api_depth = argv[2]
const api_domain = 'wss://ws.kraken.com/'
const api_book = { bid: {}, ask: {} }
let ws

try {
  ws = new W3CWebSocket(api_domain)
} catch (error) {
  console.log(`WebSocket connection failed ${error}`)
  process.exit(1)
}

process.on('SIGINT', () => {
  ws.close()
  process.exit(0)
})

let api_data = `{"event":"subscribe", "subscription":{"name":"${api_feed}", "depth":${api_depth}}, "pair":["${api_symbol}"]}`

ws.onopen = () => {
  try {
    ws.send(api_data) // Initial subscription.
  } catch (error) {
    console.log(`Feed subscription failed ${error}`)
    ws.close()
    process.exit(1)
  }
}

ws.onerror = () => console.log('Connection Error')

ws.onmessage = (e) => {
  api_data = JSON.parse(e.data)
  // The data we care about is always an array.
  if (Array.isArray(api_data)) {
    if ('as' in api_data[1]) {
      api_update_book('ask', api_data[1].as)
      api_update_book('bid', api_data[1].bs)
    } else if ('a' in api_data[1] || 'b' in api_data[1]) {
      for (const x of api_data.slice(1, api_data.length - 2)) {
        if ('a' in x) {
          api_update_book('ask', x.a)
        } else if ('b' in x) {
          api_update_book('bid', x.b)
        }
      }
    }
    api_output_book()
  } else {
    console.log(api_data) // This would be error and information messages.
  }
}
