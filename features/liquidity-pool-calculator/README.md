# Liquidity Pool Deposit and Withdraw Calculator

Calculates proportional liquidity-pool deposits and withdrawals from reserve
balances and total pool shares. It reports the shares minted or assets returned,
slippage-protected minimums, pool ratio and deposit ratio impact without
submitting a transaction.

## How it works

The tool accepts a JSON calculation request in the form `{ poolId, action,
amountA, amountB, shares, slippageBps }`. It fetches the selected pool from
Horizon `GET /liquidity_pools/{id}`, then performs fixed-point integer
arithmetic. A result contains the reserve ratio, operation amounts, exact price
bounds, minimum receive values and price impact in basis points.

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

This is a read-only calculator. It never asks for a secret key, signs a
transaction or submits a deposit or withdrawal.
