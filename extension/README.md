# TradeTag Chrome Extension

## Install the preview

Download the ZIP from the [TradeTag installation page](https://tradetag.site/install.html), extract it, open `chrome://extensions`, enable Developer mode, and select **Load unpacked**. Choose the extracted folder. Install and unlock Binance Wallet separately before using wallet features.

The public preview has the TradeTag gateway address and a public client token preconfigured. The token is extractable and is not a secret. The gateway enforces per-IP and global rate limits. Binance Web3 API product credentials must remain on the gateway server and must never be added to this extension.

## Wallet and RPC

Wallet connection and transaction confirmation use the wallet extension installed locally by the user. The wallet signs and broadcasts through its own default RPC; users do not enter an RPC URL. TradeTag does not read or store private keys, recovery phrases, login credentials, or signatures.

## Local development

Copy `gateway/.env.example` to `gateway/.env`, add Binance Web3 API credentials to the local gateway environment, and start the gateway. Never commit `.env` or include Binance API credentials in an extension package. For the public preview, the gateway endpoint is already configured in the extension.

Token lookup, market data, and quote requests have been verified against the live gateway. Swap construction has been exercised without signing or broadcasting. Validate wallet signing and transaction submission on each supported network before relying on real transactions.
