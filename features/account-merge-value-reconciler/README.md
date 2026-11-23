# Account Merge Value Reconciler

Reconciles the native value moved by each account merge in a confirmed
transaction against its result and metadata, keeping the network fee, merge
proceeds and unrelated balance changes in separate exact-stroop totals.

Processing is local and read-only: `networks: []`, `offline: true`, no MSW
handlers, no wallet, no signing and no request of any kind.

## Inputs

Paste base64 XDR from the **same confirmed transaction**:

| Field | XDR type | Required |
| --- | --- | --- |
| Transaction envelope | `TransactionEnvelope` | yes |
| Transaction result | `TransactionResult` (the outer result for a fee bump) | yes |
| Transaction metadata | `TransactionMeta` | no — leaving it blank yields an *incomplete evidence* result, never a zero |

Each field is limited to 262,144 characters, checked before whitespace is
stripped or anything is decoded. Fields containing a checksum-valid secret seed
(`S…`) are rejected before decoding, never logged, and the form is cleared.

## Supported variants

- Envelopes: v0, v1 and fee bump (inner v1). Other union arms are `unsupported_variant`.
- Metadata: `TransactionMeta` v0–v3 (the arms in the installed `@stellar/stellar-sdk` 13.3).
  Newer arms, such as v4, are detected from the union discriminant and reported
  as `unsupported_variant` instead of being decoded as corrupt data.
- Muxed (`M…`) transaction sources, operation sources and merge destinations are
  shown exactly as written and matched to ledger snapshots through their `G…` account.

## Data provenance

| Value | Source |
| --- | --- |
| Operation order, source override, destination | envelope operations |
| Transfer amount | `AccountMergeResult.sourceAccountBalance` of a successful merge in a successful transaction |
| Network fee | outer `TransactionResult.feeCharged` |
| Fee payer | envelope source, or the outer `feeSource` of a fee bump |
| Balance evidence | paired `state`/`updated`/`removed`/`created` account snapshots in operation metadata |

Proceeds are never inferred from a current account balance.

## Compatibility checks

The three inputs are rejected as `incompatible_transaction` when the result's
fee-bump wrapping differs from the envelope, the result or metadata operation
count differs from the envelope, an operation result type differs from the
operation at the same index, or `feeCharged` exceeds the envelope's maximum fee.
A failed transaction may carry empty operation metadata.

## Evidence gaps

A result is *complete* only when every merge is verified: its source account is
removed, its destination's native delta equals the result transfer, and the
source's delta is its exact negation. Otherwise the result is *incomplete* and
lists each gap by operation index:

- `missing_metadata` — metadata absent, or snapshots needed for an exact delta are missing.
- `contradictory_metadata` — the metadata delta differs from the result transfer.
- `missing_result` — a merge has no operation result.
- `transaction_failed` — the transaction failed; merges that reported success are shown as *rolled back* and no proceeds are counted.
- `fee_payer_change` — transaction-level metadata changes the fee payer's balance (for example a refund); it is not counted as proceeds or unrelated change.
- `no_merge` — the transaction contains no account merge.

Unrelated balance changes are listed per account and operation; their net total
is shown only when every changed account has paired snapshots.

## Known limits

- The envelope, result and metadata carry no shared transaction hash, and no
  network passphrase is requested, so common origin is checked structurally but
  cannot be proven cryptographically.
- Only native balances are reconciled; trustline and Soroban changes are ignored.
- The fee is charged during fee processing, which is outside `TransactionMeta`,
  so fee debits are not cross-checked against metadata.
