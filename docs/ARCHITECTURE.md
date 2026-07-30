# Architecture

<!-- TODO(issue RevenantLabs/RevyHub#25): This page is the deliverable for the contributor-friendly architecture overview. -->

RevyHubX is a [Next.js](https://nextjs.org/) App Router application that organises user-facing tool pages, reusable UI components, and Stellar SDK logic into separate layers. Each layer has a clear responsibility so new contributors can extend the project without needing to understand every file at once.

---

## Application Layers

- `app/` contains route-level pages. Each tool route owns its form state, loading state, and user-facing copy.
- `components/ui/` contains shared presentation components such as buttons, cards, badges, and status messages.
- `components/stellar/` contains Stellar-specific display and input components such as address inputs, balance lists, QR previews, and transaction details.
- `lib/stellar/` contains SDK-facing logic, validation, and Horizon/Friendbot helpers. Route components should call these helpers instead of using the Stellar SDK directly.
- `docs/` contains contributor roadmap, issue scope, and project-level documentation.
- `docs/EXTENDING.md` is the step-by-step tutorial for adding a new tool (page, helper, tests, navigation).
- `docs/DEPLOYMENT.md` and `docs/STELLAR_BASICS.md` support operators and new Stellar developers.

#### `lib/copy.ts`

Exports `copyText(value)` which writes to `navigator.clipboard` with a user-friendly error message when clipboard access is unavailable.

### `lib/stellar/` — Stellar SDK helpers

See the "[Stellar Utility Files](#stellar-utility-files)" section below for a detailed breakdown of each file.

### `docs/` — Project documentation

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | This file — architecture overview and contributor guide. |
| `DEPLOYMENT.md` | Vercel deployment guide with environment variables and pre-deploy checks. |
| `STELLAR_BASICS.md` | Educational introduction to Stellar concepts (public keys, testnet vs mainnet, Horizon, trustlines). |
| `ROADMAP.md` | Development phases from MVP through advanced Soroban integrations. |
| `ISSUES.md` | Contributor-ready issue descriptions with acceptance criteria and difficulty levels. |

### `tests/` — Unit tests

| File | What it tests |
|---|---|
| `tests/stellar/validateAddress.test.ts` | Address validation for valid keys, invalid keys, and empty input. |
| `tests/stellar/paymentUri.test.ts` | Payment URI generation validation for destination, amount, memo, and assets. |
| `tests/stellar/transaction.test.ts` | Transaction hash shape validation (`isLikelyTransactionHash`). |

---

## Tool Page Pattern

Every tool page follows the same structure. If you are adding a new tool, replicate this pattern:

```
app/tools/<tool-name>/page.tsx  ("use client")
```

### Step-by-step pattern

1. **Character panel** — A `<CharacterPanel>` with a unique `tone` (one of `star`, `moon`, `rocket`, `faucet`, `detective`, `wallet`, `trust`) that introduces the tool's "helper character" with an eyebrow label, title, and description.

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

Before opening a pull request, run:

```bash
npm run lint
npm run test
npm run build
```

The GitHub Actions CI workflow (`./github/workflows/ci.yml`) runs the same checks on pushes and pull requests.

---

## Where New Contributors Should Start

### First-time contributors

1. **Read the docs** — Start with `docs/STELLAR_BASICS.md` if you are new to Stellar, then read this architecture guide.
2. **Browse the issue ideas** — Open `docs/ISSUES.md` and pick an issue with **Intermediate** difficulty. Each issue includes acceptance criteria and specific TODOs in the codebase.
3. **Search for TODOs** — Before starting an issue, search the codebase for the matching `TODO(issue #N)` comment. These comments mark exactly which files and functions to change.
4. **Set up the project** — Follow `CONTRIBUTING.md` to clone, install, and run the project locally.

### Adding a new tool

1. Create `app/tools/<tool-name>/page.tsx` with `"use client"`.
2. Define a unique `CharacterPanel` tone or reuse an existing one.
3. Build a form following the [Tool Page Pattern](#tool-page-pattern).
4. Create or reuse a Stellar helper in `lib/stellar/` if your tool needs Horizon or SDK calls.
5. Add an entry to the `tools` array in `lib/constants.ts` with a unique `lucide-react` icon and a status.
6. Add the tool route to `Sidebar.tsx` (it will render automatically from the `tools` array).
7. Write unit tests in `tests/` for any new validation logic.
8. Add testnet-only warnings if your tool should not work on mainnet.

### Modifying an existing tool

1. Find the tool page under `app/tools/<tool-name>/page.tsx`.
2. Search for `TODO(issue #N)` comments in the file for guidance on what needs to change.
3. If the change affects Stellar network logic, update the helper in `lib/stellar/`.
4. If the change affects the user interface, modify or create components in `components/`.

### Understanding the code flow

To trace a complete request:

1. User visits `/tools/balance-viewer`.
2. `app/tools/balance-viewer/page.tsx` renders `CharacterPanel`, a `<form>` with `<AddressInput>`, and a `<StatusMessage>`.
3. User submits the form → `handleSubmit()` is called.
4. `handleSubmit()` calls `getAccountBalances(address, network)` from `lib/stellar/account.ts`.
5. `getAccountBalances()` validates the address using `validatePublicKey()` from `lib/stellar/validateAddress.ts`.
6. If valid, it calls `getHorizonServer(network).loadAccount()` from `lib/stellar/horizon.ts`.
7. The response is mapped to `DisplayBalance[]` and returned to the page.
8. The page sets state → re-renders with `<BalanceList>` showing the balances.
9. On error, the page shows a `<StatusMessage>` with a human-readable message.

---

## Key Design Decisions

- **No secret key handling** — The app never asks for secret keys, seed phrases, or private keys. Freighter Connect only requests a public key.
- **Testnet-first** — The app defaults to testnet. Mainnet is available for read-only Horizon queries (balances, transactions, trustlines).
- **Client-side only** — All Stellar interactions happen client-side via the browser. No backend API routes are needed.
- **Persisted network** — Network selection persists in `localStorage` so users do not have to switch on every visit.
- **TODOs in code** — Unfinished work is tracked with `TODO(issue #N)` comments that reference issue numbers in `docs/ISSUES.md`. This helps contributors find exactly where to make changes.
