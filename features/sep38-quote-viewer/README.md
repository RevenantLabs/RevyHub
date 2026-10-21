# SEP-38 Indicative Quote Viewer

Show an indicative exchange rate for one off-chain asset and one on-chain
Stellar asset. The number comes from a SEP-38 anchor's public `GET /price`
endpoint. It is not a firm quote and this tool cannot execute it.

## How it works

1. The home domain, both asset identifiers, the sell side, and the sell amount
   are validated locally. An invalid value never starts a request.
2. `https://<domain>/.well-known/stellar.toml` is fetched over HTTPS, with
   redirects refused. `ANCHOR_QUOTE_SERVER` is required. An anchor that does
   not publish one is rejected. The quote server URL is not guessed.
3. The tool sends `GET {ANCHOR_QUOTE_SERVER}/price` with `sell_asset`,
   `buy_asset`, and `sell_amount`. Exactly one asset is `iso4217` and the
   other is `stellar`. Selling either side is allowed. The opposite side is
   the buy asset.
4. The screen shows the returned price, both asset identities, and the
   expiration time when the anchor sent one. A warning states that the figure
   is indicative only.

## Unsupported pair versus a failed request

A `400`, `404`, or `422` whose body says the pair is unsupported becomes
`unsupported_pair`. Timeouts, HTTP 5xx, redirects, non-JSON success bodies,
and a price that is not a decimal string become `request_failed`. Those two
outcomes use different copy so a missing market is not described as a broken
connection.

## Amounts and secrets

Sell amounts, prices, fees, and reported buy amounts stay decimal strings.
The zero check uses `BigInt`, so a 22-digit amount is not rounded through
`Number`. Secret seeds are rejected on the `S` prefix before any checksum and
are cleared from the form so they are neither stored nor shown.

## Network context

The request does not go to Horizon. The selected network is stored beside the
result because an anchor quote from the testnet context should disappear when
the user switches to mainnet. Switching networks derives that staleness during
render.

## Layout

The form is a single column by default and two columns from the `sm`
breakpoint. At 390px every field, the price, and the asset identities stack
and long issuers wrap.

## Out of scope

Firm quotes need SEP-10 authentication and `POST /quote`. This tool never
calls that route and never submits a trade.
