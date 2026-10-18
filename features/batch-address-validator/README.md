# Bulk Address Validator

Validates a whole list of Stellar addresses at once — pasted with newlines,
commas or spaces — and reports per-line results plus a summary of what failed
and why.

## How it works

`parseBatchAddressValidatorInput` splits the pasted text on newlines, commas and
whitespace, then `runBatchAddressValidator` calls `validateAddress` from
`features/address-validator` for each token. That reuses the same prefix
detection, checksum checks and secret-seed redaction as the single-address tool.

Duplicate addresses are detected after normalisation (whitespace stripped) and
reported with the line numbers where each duplicate appears. A summary counts
valid rows, invalid rows, duplicated rows and any secret keys that were rejected
without being displayed.

The row limit is **500 addresses** per submission (`MAX_LINES` in `schema.ts`).

## Result codes

Per-line codes match the address validator: `valid`, `secret_seed_rejected`,
`unknown_prefix`, `bad_checksum_or_length`, `unsupported_kind`.

Form-level codes:

| Code | Meaning |
| --- | --- |
| `empty_input` | Nothing was submitted |
| `no_valid_lines` | Text parsed but contained no address tokens |
| `too_many_lines` | More than 500 addresses in one paste |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Separator splitting, empty-input and row-limit checks |
| `lib/batchAddressValidator.ts` | Per-line validation and duplicate detection |
| `lib/batchAddressValidator.errors.ts` | Re-exports redaction helper |
| `lib/format.ts` | Summary and per-line reason labels |
| `hooks/useBatchAddressValidator.ts` | Synchronous state machine |
| `components/` | Form, result table, empty state and panel |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic addresses from fixed seeds |

## Safety

This tool never asks for, transmits, stores or displays a secret key. Any row
starting with `S` is counted, rejected and shown only as "Secret key — not
shown". Treat such a key as compromised if it was pasted anywhere else.

No network requests are made.
