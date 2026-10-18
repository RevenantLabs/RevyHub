# Ledger Close Cadence Explorer

Measures observed spacing between recent Horizon ledger close timestamps for the selected network.

## Behavior

1. Validate a sample size between 2 and 200.
2. Fetch `GET /ledgers?order=desc&limit=N` from the selected Horizon endpoint.
3. Drop malformed records, sort the remainder by sequence ascending, and compute adjacent close-time intervals.
4. Report median / min / max interval, sequence gaps, repeated timestamps, and unusually long intervals.

A long interval in the sample is an observation, not proof of consensus failure or an endpoint outage. Sequence gaps are listed separately from time gaps.

## Data boundaries

- Network: configured testnet or mainnet Horizon only.
- History is bounded by the requested sample size; there is no unbounded scan.
- Amounts and ledger sequences are handled as strings / `BigInt`; no secret keys are accepted.

## Design decisions

- Malformed records are skipped when at least two valid ledgers remain, so one bad row cannot erase an otherwise useful sample.
- Unusual spacing is flagged relative to the sample median (3×), not a fixed SLA.
- Repeated timestamps are kept as zero-duration intervals so they remain visible.
