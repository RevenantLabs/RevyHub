# Order Book Viewer

Normalizes bid and ask levels into a compact order-book view. It calculates the
best prices, spread, mid-price, cumulative depth and top-five imbalance with
deterministic fixed-point arithmetic.

## How it works

The tool accepts a JSON object containing `selling` and `buying` assets plus an
optional `limit`. It requests Horizon `GET /order_book` with the native or
issued-asset query parameters. The result returns sorted levels with cumulative
totals plus best bid/ask, spread, mid-price, imbalance and the selected
network. Horizon's `price_r` fraction is retained for every displayed price.

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

This is a read-only market-data view. It never asks for a secret key, signs a
transaction or places an order.
