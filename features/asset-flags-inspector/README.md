# Issuer Authorization Flags Inspector

Look up an issuing account on Horizon and see its authorization flags
(`auth_required`, `auth_revocable`, `auth_clawback_enabled`, `auth_immutable`)
with plain-language explanations of what each flag lets the issuer do to
holders.

## How it works

The tool validates a Stellar public key, then calls Horizon
`GET /accounts/{issuer}` on the selected network. It reads the account's
`flags` object and maps each boolean to a holder-facing consequence. Special
combinations — such as full issuer control (`auth_required` +
`auth_revocable`) or permanent settings (`auth_immutable`) — are called out
explicitly.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Issuer address parsing and validation |
| `lib/` | Horizon fetch, flag parsing, error mapping and wording |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic issuer accounts with varied flag sets |
| `msw/` | Horizon request mocks |

## Safety

This tool only reads public account data from Horizon. It never asks for a
secret key or signing material.
