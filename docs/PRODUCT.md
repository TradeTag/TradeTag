# Product and MVP Design

## Positioning

TradeTag helps people review an asset when they encounter a token mention on X. The extension surfaces asset identity, available market data, and quotes without taking custody of funds. It is an independent third-party product and is not an official Binance product.

## MVP scope

1. The Chrome Manifest V3 extension runs on `x.com` and `twitter.com`.
2. Users can search a ticker or paste a full contract or mint address. Search results are candidates, not proof of identity; the user must verify the chain and address.
3. A token contract or mint address is the asset identifier. Cards show the network and address alongside market data so similarly named assets can be distinguished.
4. Trading is available only when Binance Web3 API returns a usable route and the installed wallet supports the selected network. TradeTag does not claim every asset or chain is tradable.
5. The card provides asset lookup, price and candle data, buy/sell selection, amount entry, slippage settings, and a quote summary.
6. The user reviews the transaction and confirms it in the locally installed wallet. TradeTag never signs on the user's behalf.
7. The product website provides product information, privacy and security details, installation steps, and an extension download.

## User flow

1. Download the extension from the TradeTag website and load it in Chrome.
2. Select a detected ticker or enter a contract address on X.
3. Choose the network and verify the asset identity in the card.
4. Review available market data and candles.
5. Enter an amount, choose a direction and slippage setting, then request a fresh quote.
6. Review the transaction details and confirm or reject the request in the wallet.

## Visual direction

- Use a focused dark trading interface with warm yellow accents and a clear hierarchy for numeric data.
- Keep TradeTag's name and visual identity distinct from other brands. Do not imply official endorsement.
- Use a floating card that works with X's scrolling and dynamic content and can be dismissed or minimized.
- Show loading, empty, ambiguous, unavailable, error, and success states. Keep transaction risk guidance visible.

## Product decisions

- A ticker is a search term, not a unique asset identifier. Users must verify the network and contract address before trading.
- Distinguish asset lookup, quote availability, and wallet compatibility as separate states.
- An address alone does not reliably identify its network.
- Quotes are short-lived. Refresh them before transaction construction and display the quote time.
- Never open a wallet prompt or initiate a trade without an explicit user action.
- Building a wallet-specific transaction requires a public wallet address. The gateway forwards it to Binance Web3 API for that request and does not log or persist it. Login credentials, private keys, recovery phrases, and signatures stay with the user's wallet.
