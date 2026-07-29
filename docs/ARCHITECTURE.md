# Architecture

RevyHubX is a Next.js App Router application that keeps user-facing tool pages, reusable UI, and Stellar SDK logic in separate layers.

## Application Layers

- `app/` contains route-level pages. Each tool route owns its form state, loading state, and user-facing copy.
- `components/ui/` contains shared presentation components such as buttons, cards, badges, and status messages.
- `components/stellar/` contains Stellar-specific display and input components such as address inputs, balance lists, QR previews, and transaction details.
- `lib/stellar/` contains SDK-facing logic, validation, and Horizon/Friendbot helpers. Route components should call these helpers instead of using the Stellar SDK directly.
- `docs/` contains contributor roadmap, issue scope, and project-level documentation.
- `docs/DEPLOYMENT.md` and `docs/STELLAR_BASICS.md` support operators and new Stellar developers.

## Current Stellar Workflows

- Address validation uses Stellar SDK `StrKey` checks and never asks for secret keys.
- Balance viewer loads account balances through Horizon using the selected network.
- Trustline checker validates account and issuer addresses before loading balances on the selected network.
- Payment QR generator uses the reusable `validatePaymentForm` function in `lib/stellar/paymentUri.ts` to validate destination, amount, memo length, and issued asset metadata before generating a URI.
- Transaction lookup validates hash shape before querying Horizon on the selected network.
- Testnet faucet calls Friendbot and remains explicitly testnet-only.
- Freighter Connect is a public-key connection example that displays extension availability, permission state, wallet network, and network mismatch warnings. It does not request signatures or secrets.

## Network Model

`lib/stellar/horizon.ts` owns the default network and Horizon URLs. The app defaults to testnet unless `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` is provided. `components/stellar/NetworkProvider.tsx` stores the user's selected network in `localStorage` and passes it into Horizon-backed tool pages.

New Horizon helpers should accept an optional `StellarNetwork` argument and default to `STELLAR_NETWORK`. Testnet-only tools should keep explicit copy that they do not use real funds.

## Quality Gates

Maintainers and contributors should run:

```bash
npm run lint
npm run test
npm run build
```

The GitHub Actions workflow runs the same checks on pushes and pull requests.

## Maintainer Priorities

The project intentionally keeps a contributor roadmap, but maintainer-led development should continue landing complete improvements before expanding the backlog. High-value next steps are:

- Expand unit coverage around account, trustline, and Friendbot error states with mocked network calls.
- Add E2E coverage for the primary tool forms.
