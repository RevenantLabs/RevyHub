# Trade History Viewer

Normalizes a supplied set of account fills into a chronological trade-history
table. It preserves pair, side, price, amount, optional fee and transaction
hash fields while supporting deterministic pagination.

## How it works

The tool accepts a JSON object with an asset pair, an account, or both, plus an
optional cursor and limit. It requests Horizon `GET /trades` with the selected
filters and normalises both sides of each record. The result returns the cursor
links, page state, exact execution price, counterparties and whether the trade
came from an order book or liquidity pool.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

This is a read-only history view. It never asks for a secret key, signs a
transaction or submits a trade.
