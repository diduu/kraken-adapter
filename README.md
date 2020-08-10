# kraken-adapter

This project is a nodeJS API adapter for the [kraken](kraken.com) cryptocurrency exchange.
The requirements of the project were as follow:
- Store trades and order status information in a file (or a set of files)
- Run for whole days on Linux 
- Handle situation like internet disconnection, program crashes, etc.

## The asset pairs

Whether we are looking for orders or trades, we need to specify an asset pair. In order to get the list of availbale asset pairs, run `./getAssests.js` and you will get two json files:
- asset_pairs.json : all available pairs under the default format for the api.
- asset_pairs_ws.json : all available pairs under the format that the websocket api uses (ISO 4217).

## The orders

For the orders, I made a script that subscribe to the websocket api of the exchange in order to maintain a real time order book. Run `./order_book.js symbol depth` with symbol being an asset pair under the ISO 4217 format and depth the size of the order book (limit: 500).

The order book is then saved as a json file in the orders folder and is being updated in real time.

## The trades

For the trades history, I used this time the REST api of the exchange. If it is the first time we run the script, we get the latests trades. Getting the entire list of past trades is not possible as it reaches the api limit. Once the script has been ran once, the next time we run it, it will update the data we have with more recent trades.

Run `./recent_trades write symbol` to save the data to json files (replace `write` by  `log` to simply have it in the terminal). Here, symbol needs to be under the default format for the api. You can use a json file containing an array of symbols in place of `symbol` in the command.

In order for this to be running for days, you will need to use a scheduler like [cron](https://en.wikipedia.org/wiki/Cron) to run the command regularly.

Another option would have been to make the script itself call infinitely the api and wait a predefined amount of time between each calls (with its builtin `setTimeout`). I did not do that because the waiting time is at the scale of minutes to hours. At this level, cron is more reliable than `setTimeout` in case of crashes or disconnections.
