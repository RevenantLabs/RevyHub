# Liquidity Pool ID Calculator

Given two reserve assets and a pool fee, computes the resulting constant-
product liquidity pool's deterministic ID using the same hashing rule the
network uses — entirely offline, before the pool necessarily exists.

## How it works

**Data source:** local computation using the Stellar SDK's XDR types; fully
offline.

1. `schema.ts` validates both assets (native, or a 1–12 character code plus
   a `G…` issuer — rejecting anything that looks like a secret key) and the
   pool fee.
2. `lib/asset-canonical-order.ts` orders the two assets using `Asset.compare`
   — the same comparison stellar-core's pool ID derivation requires
   (`assetA` strictly less than `assetB`) — and rejects identical assets,
   since they have no valid ordering.
3. `lib/pool-id-hash.ts` computes `SHA-256` over the XDR encoding of
   `LiquidityPoolType::LIQUIDITY_POOL_CONSTANT_PRODUCT` followed by
   `LiquidityPoolConstantProductParameters { assetA, assetB, fee }` — the
   exact payload stellar-core hashes to derive a pool ID.

## The non-obvious decision

The Stellar SDK exports a convenience `getLiquidityPoolId()` function that
computes this same hash — but its `LiquidityPoolAsset` constructor hard-codes
rejecting any fee other than `30` (`LiquidityPoolFeeV18`), because
stellar-core today only ever *creates* 30 bps pools via Horizon's deposit
flow. That restriction lives in the convenience wrapper, not in the XDR
format: `LiquidityPoolConstantProductParameters.fee` is a plain `int32`, and
the hash is well-defined for any value.

This tool validates the fee against the protocol-level range (0–10,000
basis points, i.e. 0%–100%) and assembles the hash payload directly from raw
XDR, rather than reusing the SDK's narrower wrapper. `__tests__/pool-id-hash.test.ts`
cross-checks this crate's output against the SDK's own `getLiquidityPoolId`
at 30 bps — the one value where a direct comparison is possible — to confirm
the two implementations agree exactly before trusting this one for other
fee values. The README and the fee field both note that stellar-core
currently only *creates* 30 bps pools in practice.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata (offline, no supported networks) |
| `schema.ts` | Input parsing and validation |
| `lib/asset-canonical-order.ts` | Canonically orders the two assets |
| `lib/pool-id-hash.ts` | Computes the deterministic pool ID hash |
| `lib/fee-bounds.ts` | Validates the pool fee's valid range |
| `lib/liquidityPoolIdCalculator.ts` | Orchestrates the above into one `Result` |
| `hooks/` | React state machine (synchronous — no loading state) |
| `components/CanonicalOrdering.tsx` | Shows the canonical A/B assignment |
| `components/ComputedPoolId.tsx` | Shows the computed pool ID |
| `components/FeeBoundsNotice.tsx` | Explains the valid fee range |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data, including reversed-order and boundary-fee edge cases |
| `msw/` | Empty — this tool makes no request |
| `e2e/` | Declarative end-to-end specifications |

## Safety

This tool never accepts, displays, stores or transmits a secret key, and
never submits anything — it only computes a hash from the values entered.
