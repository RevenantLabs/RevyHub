# Transaction Balance Change Reconciler

Turns before/after ledger-entry changes in transaction metadata into a
per-account, per-asset balance report with an explicit reconciliation residual.
Everything runs offline from three pasted XDR blobs — envelope, result and
metadata. Nothing is fetched.

## How it works

1. Decode the metadata variant the installed SDK exposes (`operations` / v0,
   `v1`, `v2`, `v3`). Anything else is `unsupported_variant`.
2. Walk `txChanges` / `txChangesBefore`, each operation's changes, and
   `txChangesAfter`. Pair created / state / updated / removed entries by
   **canonical ledger key**.
3. Keep only account native balances and issued-asset trustlines (issuer
   retained). Offers, data entries, claimable balances and pool shares are
   skipped and counted as non-balance evidence.
4. Collapse repeated touches to the same account/asset into one net delta.
5. Read the fee charged from the result and the fee source from the envelope
   (outer fee source for a fee-bump). Sponsorship is reported when those two
   accounts differ.
6. For each asset, compute `residual = summedDelta − expectedSum`:
   - native expected sum = `−feeCharged`
   - issued asset expected sum = `0`

A non-zero residual is unexplained. It is never labelled a payment.

## The non-obvious decision

**Deltas are observations, not classifications.**

Horizon effects and payment ops encourage calling every balance movement a
"payment". This tool refuses that: a fee debit, a trustline create, a merge and
a path-payment hop all look like ledger balance changes. The report shows the
numbers and the residual; the user decides what the movement was.

## Incomplete evidence is a first-class state

Missing a before or after side, skipping non-balance entries, or failing to
close a residual does not invent an answer. The UI keeps the partial report and
surfaces `incomplete-evidence` reasons next to the residual table.

## Bounds

- Each XDR blob ≤ 65,536 characters; passphrase ≤ 256.
- Secret seeds matching `S…` are refused on the prefix alone and cleared from
  the form.
- Amounts stay as integer stroop strings end-to-end.

## Fixtures

`fixtures/normal.fixture.ts` builds protocol-correct envelopes and metadata
from fixed seeds. `fixtures/boundary.fixture.ts` covers unexplained residuals,
unpaired removals, account removal and non-balance-only metadata.
