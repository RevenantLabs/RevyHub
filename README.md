# RevyHubX

An open-source toolkit of small, focused utilities for Stellar developers —
address validation, balance and trustline inspection, transaction lookup,
payment requests, wallet detection and testnet funding, with more tools being
added continuously by contributors.

Every tool is read-only. RevyHubX never asks for a secret key and never signs
or submits a transaction.

## Architecture in one paragraph

The app is a small stable **core** plus any number of independent **feature
slices**. Each tool is one directory under `features/` that owns its logic,
validation, state, UI, tests, fixtures, request mocks and documentation. The
tool registry is *generated* from those directories, so adding a tool requires
creating one new directory and editing nothing else — which is what lets many
contributors work in parallel without ever conflicting.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and
[docs/FEATURE_CONTRACT.md](./docs/FEATURE_CONTRACT.md).

## Tools

| Tool | What it does |
| --- | --- |
| Address Validator | Validates Stellar addresses and explains exactly why one is rejected |
| Balance Viewer | Every balance an account holds, including pool shares |
| Trustline Checker | Whether an account trusts a specific asset from a specific issuer |
| Payment QR Generator | Builds a SEP-0007 request and renders it as a QR code |
| Transaction Lookup | Ledger, fee, memo, result and operations for a transaction hash |
| Freighter Connect | Detects the wallet and warns about a network mismatch |
| Testnet Faucet | Funds a testnet account through Friendbot |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS ·
`@stellar/stellar-sdk` · Vitest · Testing Library · MSW · axe-core

## Local setup

```bash
git clone https://github.com/RevenantLabs/RevyHub.git
cd RevyHub
npm install
npm run dev
```

Optional environment overrides:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_TESTNET_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_HORIZON_MAINNET_URL=https://horizon.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_TESTNET_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_MAINNET_URL=https://mainnet.sorobanrpc.com
```

Testnet is the default, and the network switch in the header is persisted.

## Commands

```bash
npm run dev                  # dev server
npm run registry             # regenerate the feature registry
npm run new:feature          # scaffold a complete feature slice
npm run verify:features      # check every slice against the feature contract
npm run verify:issues        # check 40+ independent issues and the advanced wave
npm run issues               # preview the next five GrantFox issue payloads
npm run test                 # unit, hook, component and accessibility tests
npm run lint
npm run build
npm run check                # everything CI runs
```

## Contributing

Most open issues ask for a new tool, and each one is a complete vertical slice.
Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and
[docs/FEATURE_CONTRACT.md](./docs/FEATURE_CONTRACT.md), then:

```bash
npm run new:feature -- <slug> "<Title>" <category>
```

Maintainers publish contributor work in independent batches of five using the
[GrantFox issue workflow](./docs/ISSUE_PUBLISHING.md).

## Security

See [SECURITY.md](./SECURITY.md). RevyHubX is read-only by design.
