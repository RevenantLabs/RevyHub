# Minimum Balance and Reserve Calculator

This tool explains why an account cannot spend all of its XLM. It reads the
account's current reserve inputs and shows its minimum balance, selling
liabilities, sponsorship adjustments, and non-negative spendable balance.

## How it works

The slice loads the account from Horizon and then requests the latest ledger
on the selected network. It computes the minimum in integer stroops as
`(2 + subentry_count + num_sponsoring - num_sponsored) × base_reserve`, and
computes spendable XLM as `native balance - minimum balance - selling
liabilities`, clamped to zero.

## Why the ledger is loaded separately

The network's base reserve can change, so it is never hard-coded. The result
keeps the latest ledger sequence beside the reserve and displays both, making
the source of the calculation explicit. All arithmetic uses `BigInt`; decimal
amount strings are converted to stroops before calculation and never pass
through floating-point numbers.

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

This tool is read-only. It accepts only a public G-address and never asks for,
stores, displays, or transmits a secret key.
