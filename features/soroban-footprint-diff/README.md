# Soroban Footprint Difference Inspector

Fully offline comparison of two pasted simulation-result JSON payloads.

## Behavior

1. Validate both pastes (non-empty, size-capped).
2. Require `footprint.readOnly` / `footprint.readWrite` arrays.
3. Decode ledger keys (opaque labels or LedgerKey XDR).
4. Treat the same key in both sets as an access-mode conflict.
5. Diff additions, removals and mode changes; show optional resource fields as simulation outputs only.

## Data boundaries

- No network calls (`networks: []`, `offline: true`).
- Pastes are never persisted.
- Input size capped at 100,000 characters per side.

## Design decisions

- A footprint is a proposal for one simulated transaction, not proof of a later ledger write.
- Resource fields are shown only when present and labeled as simulation output.
