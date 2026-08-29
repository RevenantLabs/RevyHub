# Issuer Authorization Flags Inspector

This tool allows users to inspect the authorization flags set on a given Stellar account. It presents the four authorization flags (auth_required, auth_revocable, auth_immutable, auth_clawback_enabled) with clear, plain-language consequences for holders of assets issued by that account.

## How it works

The tool accepts a valid Stellar account ID and queries the Horizon server (`/accounts/:accountId`) to fetch the account's details. It extracts the `flags` object from the response and maps it to a human-readable display of authorization requirements, highlighting combinations like full issuer control and immutable settings.

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

This tool only reads public data from the network and never asks for or requires a secret key.
