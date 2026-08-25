# Balance Viewer

Loads every balance line an account holds on Horizon and renders them in one
accessible table.

## How it works

Horizon returns three different balance shapes — `native`, `credit_alphanum4`
/ `credit_alphanum12`, and `liquidity_pool_shares` — each with a different set
of fields. `normalizeBalance` collapses them into a single `DisplayBalance`
type so the table has one row shape, and `sortBalances` puts the native balance
first, credit assets alphabetically, then pool shares.

Amounts are never parsed with `Number`. Stellar amounts carry seven decimal
places and can exceed `Number.MAX_SAFE_INTEGER`, so `formatAmount` works on the
string and `totalLiabilities` sums in `BigInt` stroops.

Switching the network in the header clears the result: the same address holds
different balances on testnet and mainnet, and showing a stale table would be
actively misleading. A request counter discards responses that arrive after a
newer request or a network switch.

## Error codes

| Code | Cause |
| --- | --- |
| `empty_input` / `invalid_address` | Caught locally, before any request |
| `account_not_found` | Horizon 404 — the account is unfunded on this network |
| `rate_limited` | Horizon 429 |
| `request_failed` | 5xx, transport failure or timeout |

## Safety

Balances are public ledger data. This tool is read-only, never asks for a
secret key and never submits a transaction.
