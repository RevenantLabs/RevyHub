# Signer Rotation Impact Auditor

Compares a public Horizon account signer snapshot with a proposed ordered
`set_options` rotation and reports which authorization thresholds become
unreachable after each step.

## What it accepts

- Horizon `/accounts/{id}` JSON pasted by the user (public fields only).
- A classic v0/v1 or fee-bump transaction envelope whose operations include
  `set_options` changes (signer add/remove/weight, master weight, thresholds).
- A network passphrase used solely to decode the envelope with the installed
  Stellar SDK.

The tool is fully offline: `networks: []`, empty MSW handlers, no wallet
connection and no submission.

## How reachability is computed

Signer weights and thresholds are exact non-negative integers (0–255). The
available weight after each applied step is the BigInt sum of remaining signer
weights. A threshold is reachable when `available >= required`. Missing signer
or threshold evidence yields `reachable: null` — never a fabricated claim.

Only operations whose effective source matches the snapshot `account_id` mutate
the audited state. Foreign-source `set_options` are listed but skipped.
Zero-weight signer updates remove that key. Duplicate keys in later operations
overwrite earlier weights in envelope order.

## Lockouts

- **Intermediate lockout** — any step before the final one left a threshold
  unreachable.
- **Final lockout** — the post-envelope state still cannot meet a threshold.
- **Recovered final** — an intermediate lockout was cleared by later ops; both
  facts are reported so a transient unsafe path is never mistaken for a safe
  one.
- **First locking operation** — the earliest step that introduced an
  unreachable threshold.

## Known limits

- Advisory only: signatures are not verified and the envelope is never
  submitted.
- Non-`set_options` operations on the snapshot account are recorded as ignored;
  they do not change weights.
- Unknown Horizon fields outside signers/thresholds are ignored rather than
  asserted.
- Secret seeds (`S…`) are refused on the prefix alone and never echoed.
