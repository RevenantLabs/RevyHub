# Sequence Number Inspector

Shows an account's current sequence number, the next valid sequence, and how a bump-sequence operation would change it, including the ledger-derived maximum.

## How it works
It parses the 64-bit integer sequence number from the account endpoint using `BigInt` to prevent JavaScript precision loss. It uses bitwise operations to separate the ledger and offset parts.

## Non-obvious decisions
- Kept the `BigInt` end-to-end to avoid silent rounding bugs.
- Highlighted `tx_bad_seq` in the result UI, as sequence mismatches are a leading cause.
