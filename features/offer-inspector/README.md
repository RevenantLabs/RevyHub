# Account Offers Inspector

Inspects all open decentralized exchange (DEX) offers for a Stellar account on Horizon, computes gross base reserve requirements, and displays offer details in an accessible table.

## How it works

Horizon returns open offers via `/accounts/{account_id}/offers`. `runOfferInspector` checks `server.loadAccount(accountId)` first to verify the account exists on the network, distinguishing unfunded accounts (404) from funded accounts with zero open offers. It queries the latest ledger (`server.ledgers().order("desc").limit(1).call()`) to retrieve the current network base reserve.

Each open offer requires one base reserve entry (e.g. 0.5 XLM / 5,000,000 stroops). Gross reserve calculations use `BigInt` stroop arithmetic without floating-point math to eliminate rounding inaccuracies. If an account has sponsored entries, the tool notes that sponsors may fulfill part or all of the reserve requirement.

Offer IDs and amounts are preserved as exact strings without numeric conversion. Prices are displayed with both the decimal rate and the exact rational fraction `(n / d)` from Horizon.

If the account has more open offers than the page limit, the tool displays a partial badge, warning notice, and a "Load more offers" button for cursor-based pagination. Subsequent pages are deduplicated by offer ID.

Switching the network clears the result to avoid displaying stale data across networks.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata and icon configuration |
| `schema.ts` | Stellar public key validation and secret key rejection |
| `types.ts` | Type definitions for offers, reserves, errors, and input |
| `copy.ts` | Accessible user-facing copy and error mappings |
| `lib/format.ts` | String formatting and integer stroop conversion |
| `lib/offerInspector.errors.ts` | Horizon error code mapping |
| `lib/offerInspector.ts` | Horizon queries, reserve calculation, pagination, and deduplication |
| `hooks/useOfferInspector.ts` | React state machine and network lifecycle handling |
| `components/` | Form, table result, empty, and panel components |
| `__tests__/` | Unit, hook, component, and axe accessibility tests |
| `fixtures/` | Deterministic fixture data generated from raw seeds |
| `msw/` | Horizon HTTP mock handlers for tests |

## Error codes

| Code | Cause |
| --- | --- |
| `empty_input` / `invalid_address` | Caught locally before any network request; secret seeds starting with `S` are rejected |
| `account_not_found` | Horizon 404 — the account does not exist on this network |
| `rate_limited` | Horizon 429 — too many requests to Horizon |
| `request_failed` | Horizon 5xx, network error, or timeout |

## Safety

Open offers are public ledger data. This tool is read-only, never asks for a secret key, rejects secret seeds starting with `S` before validation, and never submits a transaction.

