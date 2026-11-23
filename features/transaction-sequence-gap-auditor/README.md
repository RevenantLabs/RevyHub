# Transaction Sequence Gap Auditor

Audits a public Stellar account's recent transaction sequence history. It separates normal
sequence use, failed-transaction evidence, proved `bump_sequence` jumps, unexplained gaps,
and gaps whose oldest boundary cannot be established from the bounded history window.

## How it works

The tool reads Horizon on the selected Testnet or Mainnet network. It requests
`/accounts/{id}/transactions?order=desc&limit=20&include_failed=true`, follows cursors for
at most five pages, and keeps at most 100 unique transactions. Every request is bound to
the selected network.

Transactions are ordered with `BigInt` sequence comparisons. Successful and failed
transactions both consume source-account sequence numbers, but their counts remain
separate. For each observed jump, the earlier successful transaction's operations are
checked for a matching account-sourced `bump_sequence`. A jump is proved only when that
operation's `bump_to` matches the next observed sequence.

Reaching the five-page bound means older evidence may exist. A gap at that oldest
boundary is therefore labelled `unexplained_truncated`; the tool does not claim that a
transaction is missing. Internal unexplained gaps remain distinct.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

This tool accepts only public G-addresses. It never asks for or sends a secret seed.
Muxed and contract addresses are rejected as unsupported variants.

## Limits

- 20 transactions per page
- 5 pages per audit
- 100 unique transactions maximum
- 15-second request timeout
- 20 operations maximum for each candidate bump transaction
