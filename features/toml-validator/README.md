# stellar.toml Validator

Validate pasted or fetched SEP-1 `stellar.toml` metadata. Each required and
optional field is reported independently, currencies include code and issuer
checksum results, and fetched responses include a CORS warning/pass result.

## How it works

Pasted TOML is parsed without a network request. For a hostname, only the
HTTPS well-known document is fetched, with a 100 KiB limit and redirect refusal.
The result separates errors from warnings and identifies the field responsible.

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

This validator never asks for, stores or echoes secret keys and never submits a
transaction.
