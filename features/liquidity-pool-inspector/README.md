# Liquidity Pool Inspector

Looks up a constant-product liquidity pool by its 64-character ID and reads
the reserves, total shares, participant count, fee and implied prices in both
directions.

## How it works

Horizon exposes each pool at `GET /liquidity_pools/{liquidity_pool_id}`. This
tool calls that endpoint through the Stellar SDK's `liquidityPools()` builder,
then normalises the response for display.

Implied prices and per-share reserve values are derived from the two reserve
amounts and `total_shares` using `BigInt` fixed-point arithmetic at 7 decimal
places — the same precision Stellar uses for amounts — rather than dividing
JavaScript floats.

When Horizon returns `num_pool_members`, that count is shown; otherwise the
tool falls back to `total_trustlines` (accounts holding pool share trustlines).

Because a testnet pool generally does not exist on mainnet, switching the
network clears the result instead of leaving a stale pool on screen.

## Safety

Liquidity pools are public ledger data. This tool is read-only; it never
deposits, withdraws or submits transactions.
