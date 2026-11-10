# TradeTag

TradeTag brings token research and pre-trade context to the X timeline. When a token ticker or contract address appears, the Chrome extension can look up the asset, show available market data and candles, request a quote, and hand transaction confirmation to a wallet installed by the user.

TradeTag is designed for meme tokens and other on-chain assets. Availability depends on a Binance Web3 API market or route and the wallet's support for the selected network; not every asset or chain is guaranteed to be tradable.

TradeTag is an independent third-party project. It is not affiliated with or endorsed by X or Binance.

## Project structure

- `extension/` — Manifest V3 Chrome extension for X.
- `gateway/` — Node.js gateway that signs Binance Web3 API requests on the server.
- `website/` — product and installation website with bilingual content and demo assets.
- `docs/` — product design, API integration, and privacy-boundary notes.

## Get the preview

Visit [tradetag.site](https://tradetag.site) and open the extension installation page. The current preview is distributed as a ZIP and must be loaded in Chrome Developer mode; it is not yet listed in the Chrome Web Store. Install and unlock Binance Wallet separately before using wallet features.

## Run the website locally

```sh
cd website
npm install
npm run dev
```

Create a production build with `npm run build`.

## Run the gateway locally

Use Node.js 20 or newer. Copy `gateway/.env.example` to `gateway/.env`, add Binance Web3 API credentials in that local file, and run:

```sh
cd gateway
npm install
npm start
```

Never commit `.env`, Binance API keys, or Binance API secrets. The gateway access token embedded in the public extension is a **public client token**, not a secret; it can be extracted from the ZIP or source. The deployed gateway applies per-IP and global rate limits. Keep Binance product credentials on a controlled server.

## Wallet and data boundaries

The extension does not read or store a wallet's private key, recovery phrase, login credentials, or signature. The wallet installed by the user presents the transaction for confirmation and uses its own default RPC. A public wallet address is sent through the gateway to Binance Web3 API when needed to build a wallet-specific transaction; the gateway does not log or persist it.

## Preview status

The live gateway has verified token search, market information, candles, and quote requests. Swap transaction construction has been exercised without signing or broadcasting. Wallet signing and real transaction submission still require end-to-end validation in Binance Wallet on each supported network. Review every transaction in the wallet before approving it.
