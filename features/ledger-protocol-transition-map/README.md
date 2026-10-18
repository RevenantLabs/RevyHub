# Ledger Protocol Transition Map

Scans a bounded Horizon ledger range and maps where reported protocol versions change.

## Behavior

1. Validate start ledger and bounded count (2–200).
2. Fetch consecutive `GET /ledgers?order=asc` pages until the count is filled or history ends.
3. Group adjacent same-version ledgers into runs.
4. Mark exact transitions only when both neighboring sequences were fetched; gaps yield uncertain boundaries.

## Data boundaries

- Configured testnet/mainnet Horizon only.
- No unbounded history scan.
- Sequences and protocol versions are strings / `BigInt`; no secret keys.

## Design decisions

- A missing ledger between fetched records never invents the upgrade sequence.
- Partial pages flag the scan as incomplete so trailing inferences stay conservative.
- The copyable summary is plain text for pasting into reviews or tickets.
