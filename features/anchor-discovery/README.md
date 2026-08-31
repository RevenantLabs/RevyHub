# Anchor Endpoint Discovery

Discover the standards an anchor advertises from its HTTPS
`/.well-known/stellar.toml` document. The result reports SEP-6/10/12/24/31/38
presence, signing key and network metadata, and declared currencies.

## How it works

Only the supplied hostname is contacted, over HTTPS, with redirects refused.
The response is size-limited and parsed into typed service and currency data.
Missing services, unreachable hosts and invalid TOML remain distinct errors.

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

The tool never asks for a secret key and does not sign, submit or mutate any
Stellar state.
