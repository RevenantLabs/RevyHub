# Trade Aggregation Viewer

Groups normalized trades into configurable time buckets and separates buy and
sell volume. Each bucket includes its total volume, trade count and volume-
weighted average price (VWAP).

## How it works

The tool accepts a JSON object with base/counter assets, a Horizon-supported
`resolution`, optional time bounds and an hour `offset`. It requests Horizon
`GET /trade_aggregations` and normalises each returned bucket. The result
contains aligned bounds, exact OHLC fractions, base/counter volume, trade count
and the selected network.

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

This is a read-only analytics view. It never asks for a secret key, signs a
transaction or submits a trade.
