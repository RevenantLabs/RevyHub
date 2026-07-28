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

2. **Form card** — A `<Card>` wrapping a `<form>` with input fields:
   - Use `<AddressInput>` for Stellar public address fields.
   - Use `<Input>` for text/number fields.
   - Use `<Button>` for the submit action (with a `disabled` state during loading).

3. **Status message** — A `<StatusMessage>` that shows info, success, warning, or error states. Default to an info state when no action has been taken.

4. **Result display** — Conditional rendering of result data (e.g., `<BalanceList>`, `<TransactionDetails>`, `<QRPreview>`).

5. **Contextual guidance** — Additional `<StatusMessage>` blocks for edge cases:
   - "Account not found" links to the Testnet Faucet Helper.
   - Testnet-only warnings on testnet-only tools.
   - Network mismatch warnings on the Freighter Connect page.

### State management

Each tool page manages its own state with `useState` hooks:

```typescript
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState({ type: "info", text: "..." });
const [result, setResult] = useState<ResultType | null>(null);
```

For async calls, the pattern is:

```typescript
async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setLoading(true);
  setResult(null);

  try {
    const data = await someStellarHelper(input, network);
    setResult(data);
    setMessage({ type: "success", text: "..." });
  } catch (error) {
    setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
  } finally {
    setLoading(false);
  }
}
```

### Network-aware tools

Tools that call Horizon (Balance Viewer, Trustline Checker, Transaction Lookup) use `useNetwork()` to get the current network and pass it to their Stellar helper:

```typescript
const { network } = useNetwork();
const data = await someHelper(address, network);
```

Testnet-only tools like the Testnet Faucet Helper do not use network context and display a permanent testnet warning.

---

## Stellar Utility Files

Each file in `lib/stellar/` encapsulates a single area of Stellar SDK interaction. Tool pages import these helpers instead of using the Stellar SDK directly.

| File | Exports | Purpose | Used by |
|---|---|---|---|
| `horizon.ts` | `STELLAR_NETWORK`, `StellarNetwork`, `horizonUrls`, `horizonServer`, `getHorizonServer(network)` | Shared Horizon server configuration. Reads network from env vars and provides a factory function that creates a `Horizon.Server` instance for any network. | All Horizon-backed utilities |
| `validateAddress.ts` | `validatePublicKey(value)` → `{ valid, message }` | Validates Stellar public keys using SDK `StrKey.isValidEd25519PublicKey`. Returns structured results with user-friendly error messages (empty, wrong prefix, checksum failure, valid). | Address Validator page, called by most other helpers before making Horizon requests |
| `account.ts` | `getAccountBalances(publicKey, network)` → `DisplayBalance[]`, `getResponseStatus(error)` | Loads account via Horizon and maps balances to a uniform `DisplayBalance` format (native XLM, issued assets, liquidity pool shares). Handles 404 with a network-aware error message. | Balance Viewer page |
| `trustline.ts` | `checkTrustline(account, assetCode, issuer, network)` → `{ exists, message }` | Validates both addresses, loads account from Horizon, and checks whether the account's balances include the specified asset. | Trustline Checker page |
| `transaction.ts` | `isLikelyTransactionHash(value)` → `boolean`, `lookupTransaction(hash, network)` → `TransactionSummary` | Validates hash shape (64 hex chars), fetches transaction from Horizon, and returns a typed `TransactionSummary`. | Transaction Lookup page |
| `paymentUri.ts` | `validateAssetCode(value)`, `createPaymentUri(input)` → `string` | Validates destination, amount, asset code, and memo length, then builds a `web+stellar:pay?` URI string for QR generation. | Payment QR Generator page |
| `friendbot.ts` | `fundTestnetAccount(publicKey)` → `response` | Validates the address, then calls the Friendbot endpoint. Throws on non-OK responses with a rate-limit / already-funded hint. | Testnet Faucet Helper page |

### Helper pattern

Each Stellar helper follows a consistent pattern:

1. **Validate inputs** — Call `validatePublicKey()` or inline validation for non-address inputs.
2. **Call Horizon** — Use `getHorizonServer(network)` to create a server instance and call the relevant Horizon API.
3. **Handle errors** — Check for 404 (account/hash not found) using `getResponseStatus(error)` and throw network-aware, user-friendly error messages.
4. **Return typed results** — Always return a defined TypeScript interface (no raw SDK types in page components).

---

## Anthropomorphic UI Theme

The project uses a playful "helpers" theme where each tool is represented by a character with a distinct personality. This is expressed through:

- **CharacterPanel** — Each tool page header shows a stylised face with coloured elements matching the character's tone. Seven tones exist: `star` (star clerk), `moon` (moon wallet), `rocket` (rocket assistant), `faucet` (faucet helper), `detective` (detective comet), `wallet` (wallet mascot), `trust` (trust inspector). Each tone is defined in the `toneStyles` record inside `components/ui/CharacterPanel.tsx`, which maps a tone to its `face`, `hat`, and `shadow` colour values. To add a new character tone when building a new tool, add a new entry to this record and import the tone in your page.
- **Status messages** — Use character-appropriate language (e.g., "The moon wallet is waiting for a funded testnet account address").
- **Button labels** — Use in-character action text (e.g., "Ask faucet helper to fund", "Follow transaction trail").
- **ToolCard** — Each card on the home page includes a `character` quote string that describes the helper in one sentence.

When adding new components or pages, maintain this voice:

- Describe what the character is doing in third person.
- Use warm, friendly language.
- Keep technical accuracy — do not fake blockchain data.
- Use theme colours from the Tailwind config (`stellar-cyan`, `stellar-violet`, `stellar-green`, `stellar-amber`) and the existing CSS variable patterns in `globals.css`.

---

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
