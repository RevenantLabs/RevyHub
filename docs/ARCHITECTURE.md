# Architecture

RevyHubX is a Next.js App Router application that keeps user-facing tool pages, reusable UI, and Stellar SDK logic in separate layers.

## Application Layers

- `app/` contains route-level pages. Each tool route owns its form state, loading state, and user-facing copy.
- `components/ui/` contains shared presentation components such as buttons, cards, badges, and status messages.
- `components/stellar/` contains Stellar-specific display and input components such as address inputs, balance lists, QR previews, and transaction details.
- `lib/stellar/` contains SDK-facing logic, validation, and Horizon/Friendbot helpers. Route components should call these helpers instead of using the Stellar SDK directly.
- `docs/` contains contributor roadmap, issue scope, and project-level documentation.
- `docs/EXTENDING.md` is the step-by-step tutorial for adding a new tool (page, helper, tests, navigation).
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

`lib/stellar/horizon.ts` owns the default network, Horizon URLs, and the display metadata for each network (`networkMeta`, `getNetworkLabel`, `normalizeNetwork`). The app defaults to testnet unless `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` is provided.

`components/stellar/NetworkProvider.tsx` treats the selection as an external store: the choice lives in `localStorage` and is read through `useSyncExternalStore`. The server and the first client render both use the build-time default, so a stored `mainnet` preference applies without a hydration mismatch. A `storage` listener keeps open tabs in sync, and an in-memory mirror keeps the switch working when `localStorage` is unavailable.

New Horizon helpers should accept an optional `StellarNetwork` argument and default to `STELLAR_NETWORK`. Any user-facing copy that names a network should read it from context rather than hardcoding "testnet", so it stays correct on both networks.

Testnet-only tools should render `components/stellar/TestnetOnlyNotice.tsx`. It states the limitation on testnet, and on any other network it warns that the tool is paused, disables the action, and offers a one-click switch back to testnet. The Friendbot faucet is the current example.

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
