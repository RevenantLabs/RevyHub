# Asset Supply and Holder Statistics

Loads Horizon's aggregate record for one issued asset and shows its circulating
supply, account-holder authorization split, non-account supply portions, and
issuer authorization flags.

## How it works

The tool requests `GET /assets?asset_code=...&asset_issuer=...`. Even an exact
query returns a collection, so an empty `_embedded.records` array becomes the
specific `asset_not_found` outcome rather than a generic request failure.

Horizon separates account trustlines into authorized, unauthorized, and
authorized-to-maintain-liabilities groups. The slice preserves those counts and
balances, then adds account balances, claimable balances, liquidity pools, and
Soroban contract balances to obtain circulating supply.

The non-obvious decision is precision: every amount is validated and converted
to `BigInt` stroops before addition. No value passes through `Number`, and every
display keeps exactly seven decimals, including trailing zeroes. Optional pool
and contract fields from older Horizon versions safely contribute zero.

Network results are tagged with their source network and hidden immediately on
a network switch. Abort controllers and request IDs prevent stale responses
from replacing the current state.

## Error codes

| Code | Cause |
| --- | --- |
| `empty_asset_code` / `invalid_asset_code` | Rejected locally before a request |
| `empty_issuer` / `invalid_issuer` | Rejected locally before a request |
| `asset_not_found` | Exact code and issuer query returned no records |
| `rate_limited` | Horizon returned 429 |
| `request_failed` | A malformed response, server, transport, or timeout failure |

## Safety

Asset statistics are public ledger data. This tool is read-only, rejects secret
keys on their prefix, never stores or echoes them, and never submits a
transaction.
