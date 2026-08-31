# SEP-10 Challenge Transaction Inspector

Inspect a signed SEP-10 transaction envelope entirely in the browser process.
The tool decodes XDR, checks the challenge ManageData fields, time bounds,
sequence and server signing account, and never calls Horizon or verifies TOML.

## How it works

The input is base64 transaction XDR. Results contain every structural rule as
pass/fail, the decoded operations and the expiration window. Invalid XDR,
non-challenges, expired challenges and malformed fields have distinct codes.

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

This tool is offline and never asks for, stores or echoes a secret key. It is an
inspector only: it does not sign or submit the transaction.
