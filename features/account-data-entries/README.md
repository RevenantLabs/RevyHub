# Account Data Entry Viewer

Inspect the `data` map on a Horizon account response and decode each value
locally. Printable UTF-8 stays text; anything else is shown as hex with a byte
count, because raw bytes are more honest than guessing.

## How it works

The tool fetches `/accounts/{account_id}` from Horizon, sorts the data keys,
and renders one row per entry. If a row is malformed, that row stays visible as
an invalid-base64 warning while the rest of the table continues to render.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic, decoding and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result and empty UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

This tool never accepts or echoes a secret key.
