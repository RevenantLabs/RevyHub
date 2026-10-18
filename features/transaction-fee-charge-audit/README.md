# Transaction Fee Charge Audit

Compares the maximum fee offered on a settled Stellar transaction with the fee
Horizon actually charged. Distinguishes classic and fee-bump envelopes and
shows ledger plus network context. The charged fee is historical evidence —
never a forecast of future inclusion prices.

## How it works

1. Validate a 64-character transaction hash (no network call on failure).
2. `GET /transactions/{hash}` on the selected Horizon network.
3. Identify classic versus fee-bump from `envelope_xdr` (fallback: `fee_account`).
4. Normalise `max_fee` and `fee_charged` as stroop strings and compute the exact
   difference with `BigInt`.
5. `GET /ledgers/{sequence}` for the referenced ledger's closed time and base fee.

For fee-bump envelopes the outer fee source and outer bid drive the offered /
charged comparison; the inner fee bid is shown separately and does not pay once
the transaction is wrapped.

Absent or malformed fee fields return `invalid_fee_data` — an explicit incomplete
audit with actionable copy, not a guessed difference.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Hash validation |
| `lib/transactionFeeChargeAudit.ts` | Orchestration |
| `lib/fee-fields.ts` | Classic / fee-bump normalisation |
| `lib/stroop-difference.ts` | Exact offered-versus-charged math |
| `lib/ledger-context.ts` | Referenced ledger fetch and labels |
| `hooks/` | Idle / loading / success / error state |
| `components/` | Form, result, fee breakdown, envelope, ledger |
| `__tests__/` | Domain, schema, format, hook, panel, a11y |
| `fixtures/` | Classic and fee-bump Horizon records |
| `msw/` | Horizon request mocks |
| `e2e/` | Main journey and fee-bump edge journey |

## Safety

This tool never asks for, accepts, displays, stores or transmits a secret key.
It only reads public Horizon transaction and ledger records.
