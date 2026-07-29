# Architecture

<!-- TODO(issue RevenantLabs/RevyHub#25): This page is the deliverable for the contributor-friendly architecture overview. -->

RevyHubX is a [Next.js](https://nextjs.org/) App Router application that organises user-facing tool pages, reusable UI components, and Stellar SDK logic into separate layers. Each layer has a clear responsibility so new contributors can extend the project without needing to understand every file at once.

---

## Application Layers

```
app/              Route-level tool pages and the root layout
components/       Reusable React components
  layout/         App shell, header, sidebar
  ui/             Generic presentation components (Button, Card, Badge, etc.)
  stellar/        Stellar-specific display and input components
lib/              Shared utilities and Stellar API helpers
  stellar/        SDK-facing Horizon, Friendbot, and validation logic
docs/             Contributor documentation, roadmap, issue ideas
tests/            Unit tests for core utilities
scripts/          Automation scripts (GitHub issue creation)
```

### How the layers interact

1. **`app/` pages** own their form state, loading state, and user-facing strings.
2. Pages import **`components/`** parts to render the user interface.
3. Pages call **`lib/stellar/`** helpers to interact with the Stellar network.
4. Helpers in **`lib/stellar/`** use the `@stellar/stellar-sdk` package and return typed results.
5. Pages wrap results with **`components/ui/StatusMessage`** or dedicated result components to show feedback.

```
  Tool Page (app/tools/*)
      │
      ├── imports CharacterPanel, Card, Button, Input, AddressInput (components/)
      ├── calls lib/stellar/* helper
      ├── wraps result in StatusMessage (components/ui/)
      └── renders result in dedicated display (e.g., BalanceList, TransactionDetails)
```

---

## Folder Structure Explained

### `app/` — Route-level pages

The root layout (`app/layout.tsx`) defines HTML metadata, imports `AppShell`, and wraps all children with shared layout.

#### `app/page.tsx` — Home dashboard

Introduces the project with a hero section, feature highlights, project stats, and a grid of `ToolCard` links to every tool page. Uses `tools` from `lib/constants.ts` to render each card.

#### `app/tools/*` — Tool pages

Each tool lives in its own route directory:

| Route | Tool | Network-aware |
|---|---|---|
| `/tools/address-validator` | Validate Stellar public addresses | No |
| `/tools/balance-viewer` | Inspect account balances | Yes |
| `/tools/trustline-checker` | Check issued-asset trustlines | Yes |
| `/tools/payment-qr` | Generate payment QR codes | No |
| `/tools/transaction-lookup` | Look up transactions by hash | Yes |
| `/tools/freighter-connect` | Connect to Freighter wallet | Partial |
| `/tools/testnet-faucet` | Fund testnet accounts via Friendbot | Testnet-only |

### `components/` — Reusable React components

#### `components/layout/`

| Component | Role |
|---|---|
| `AppShell.tsx` | Wraps the entire app with `NetworkProvider`, the header, sidebar, and a scrollable `<main>` area. Sets up the glass-morphism background container. |
| `AppHeader.tsx` | Sticky top bar with logo, app name, network selector `<select>`, live network badge, and a link to the GitHub repo. |
| `Sidebar.tsx` | Desktop-only navigation sidebar listing all tools with active-route highlighting. Uses the `tools` array from `lib/constants.ts` and the `lucide-react` icon from each tool definition. |

#### `components/ui/` — Generic presentation components

| Component | Props | Purpose |
|---|---|---|
| `Button` | `variant` (`primary`, `secondary`, `ghost`, `danger`), `disabled` | Themed action button with character-filled shadow styles and disabled state. |
| `Card` | `className` | Semi-transparent white card with rounded corners, border, and a pink shadow. |
| `Badge` | `tone` (`success`, `info`, `warning`, `muted`) | Small rounded pill for tags (network badge, tool status, transaction status). |
| `StatusMessage` | `type` (`success`, `error`, `warning`, `info`), `title`, `description`, `action` | Themed alert-style block with an icon, title, optional description, and optional action link (used for "account not found — fund via faucet" guidance). |
| `Input` | Standard HTML input props | Styled text input with focus ring matching the theme. |
| `ToolCard` | `title`, `description`, `character`, `href`, `status`, `icon` | Homepage card for each tool with hover animation, status badge, character quote, and "Meet helper" link. |
| `CharacterPanel` | `tone`, `eyebrow`, `title`, `description` | Header section for each tool page showing an expressive character face (coloured for each tone), a title, and a description. |

#### `components/stellar/` — Stellar-specific components

| Component | Purpose |
|---|---|
| `NetworkProvider.tsx` | React context that persists the user's selected network (`testnet` / `mainnet`) in `localStorage`. Provides `useNetwork()` hook. Wraps the entire app. |
| `AddressInput.tsx` | Label + Input combo for Stellar public addresses. Defaults placeholder to `G...`. |
| `CopyableValue.tsx` | Displays a truncated Stellar address with a "Copy" button. Handles clipboard fallback. |
| `BalanceList.tsx` | Renders a list of `DisplayBalance` items (asset code, issuer/truncated address, amount badge). |
| `TransactionDetails.tsx` | Displays a `TransactionSummary` as a key-value definition list with a `Badge` for success/failure status and a link to Stellar Expert. |
| `QRPreview.tsx` | Displays a QR code image from a data URL. |

### `lib/` — Shared utilities

#### `lib/utils.ts`

Contains:
- `cn(...inputs)` — Merges Tailwind class names using `clsx` and `tailwind-merge`.
- `truncateMiddle(value, visible)` — Truncates a long string like `GABCDE...WXYZ`.

#### `lib/constants.ts`

Defines the canonical `tools` array used by `Sidebar`, `ToolCard`, and the home page. Each tool entry includes `title`, `description`, `character` (anthropomorphic description), `href`, `status` (`"Working"`, `"MVP"`, or `"Coming Soon"`), and `icon`.

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

```
Environment variable: NEXT_PUBLIC_STELLAR_NETWORK (default: "testnet")
                           │
                           ▼
                   lib/stellar/horizon.ts
                    ┌──────────────────┐
                    │ STELLAR_NETWORK   │
                    │ horizonUrls       │
                    │ getHorizonServer()│
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
   components/stellar/               Tool pages via
   NetworkProvider.tsx               useNetwork() hook
   (persists in localStorage)        (pass network to helpers)
```

The default network is `testnet`. Users can switch between testnet and mainnet using the header dropdown. The selection persists in `localStorage` under the key `revyhubx-network`.

Tools that should always use testnet (e.g., Testnet Faucet Helper) hardcode testnet and display a permanent warning.

---

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
