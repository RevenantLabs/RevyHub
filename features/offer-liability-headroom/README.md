# Offer Liability and Capacity Audit

Diagnostic snapshot of an account's Horizon offers next to balance and liability fields.

## Behavior

1. Validate a G-address (reject secret keys).
2. Fetch `/accounts/{id}` and `/accounts/{id}/offers` on the selected network.
3. Normalize buying/selling asset identities and exact `price_r` rationals.
4. Pair offers with balance rows; warn on unmatched assets or ledger skew.
5. Never imply that estimates guarantee execution.

## Data boundaries

- Configured Horizon networks only.
- Amounts and prices stay in strings / `BigInt` rationals.
- No offer mutation.

## Design decisions

- Large ledger skew between the two reads fails as `inconsistent_snapshot`.
- Small skew is shown as a warning so the UI stays usable.
- Approximate decimals are display-only; calculations keep the fraction.
