# RevyHubX

Open-source web toolkit for Stellar developers. The MVP includes address validation, testnet balance inspection, trustline checks, payment QR generation, transaction lookup, Freighter wallet examples, and a Friendbot helper.

## Why This Exists

Stellar developers often need small utilities while learning, testing, or building integrations. RevyHubX collects those workflows in one Vercel-friendly Next.js app with clean, modular code that contributors can extend.

## GrantFox Context

This project is being prepared as an open-source Stellar ecosystem project for GrantFox. The goal is to provide a working MVP while keeping the codebase modular and contributor-friendly. Maintainer-led work now includes tested Stellar validation utilities, CI quality gates, documented architecture, and focused contributor issues for the next layer of improvements.

## Features

- Validate Stellar public addresses with Stellar SDK StrKey checks
- Switch between Stellar testnet and mainnet for Horizon-backed tools
- Inspect Stellar wallet balances through Horizon
- Check trustlines for issued Stellar assets
- Generate demo payment QR codes and copyable payment URIs
- Look up transaction hashes on the selected network
- Detect Freighter wallet public keys and wallet network mismatch states
- Fund testnet accounts through Friendbot

## Payment URI Format

The Payment QR Generator builds [SEP-0007](https://stellar.org/protocol/sep-7) `web+stellar:pay` operation URIs so generated QR codes follow the standard wallets already parse:

```
web+stellar:pay?destination=GDEST...&amount=10.5&memo=Invoice+1001&memo_type=MEMO_TEXT&network_passphrase=Test+SDF+Network+%3B+September+2015
```

- `destination` and `amount` are always included.
- `asset_code` and `asset_issuer` are included only for issued assets; native XLM payments omit both, per SEP-0007 (absence of these fields means XLM).
- `memo` is included with `memo_type=MEMO_TEXT` when a memo is entered.
- `network_passphrase` is included for testnet requests and omitted for mainnet, since the public network is the SEP-0007 default.

## Tech Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Stellar SDK
- qrcode
- lucide-react

## Screenshots

Screenshots will be added after the first Vercel deployment.

New to Stellar concepts? Read [docs/STELLAR_BASICS.md](./docs/STELLAR_BASICS.md).

## Extending RevyHubX

Want to add another Stellar utility? Read the step-by-step guide: [docs/EXTENDING.md](./docs/EXTENDING.md).

## Local Setup

```bash
git clone https://github.com/RevenantLabs/RevyHubX.git
cd RevyHubX
npm install
```

Copy the example environment file if you want to customize endpoints:

```bash
cp .env.example .env.local
```

## Environment Variables

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_TESTNET_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_HORIZON_MAINNET_URL=https://horizon.stellar.org
```

The app uses testnet by default and includes a persisted network switch for Horizon-backed tools. The Friendbot faucet remains testnet-only.

## Security Headers

Production builds serve the following security headers via `next.config.mjs`:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Restrictive CSP (see below) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (production only) |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' <horizon-endpoints> <friendbot>;
frame-src 'none';
form-action 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none'
```

- `'unsafe-inline'` on `script-src` and `style-src` is required by Next.js runtime. A nonce-based approach would require additional infrastructure (tracked as a future improvement).
- `data:` on `img-src` enables QR code rendering (base64 PNG data URIs).
- `connect-src` includes Horizon endpoints (configurable via environment) and `https://friendbot.stellar.org`.
- No external scripts, fonts, or frames are used.

### Updating CSP for New Integrations

When adding an external origin, update the CSP in `next.config.mjs`:

1. **Horizon/Soroban endpoint** — Add the URL to `connect-src`. If configurable, use an environment variable.
2. **External image host** — Add the origin to `img-src` and document in `NEXT_PUBLIC_IMAGE_ORIGINS`.
3. **External script** — Add the origin to `script-src`. Prefer `'strict-dynamic'` or nonces over `'unsafe-inline'`.
4. **Iframe embed** — Add the origin to `frame-src`.

### Verification

After a production build, verify headers are served correctly:

```bash
npm run build
npm run verify:headers
```

The verification script starts a local production server and asserts expected response headers.

## Commands

```bash
npm run dev
npm run test
npm run build
npm run lint
```

## Quality Gates

The repository includes unit tests for core Stellar validation and payment URI behavior. Pull requests and pushes to `main` run:

```bash
npm run lint
npm run test
npm run build
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the code structure and maintainer expectations.

Security expectations are documented in [SECURITY.md](./SECURITY.md).

## Deploy on Vercel

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for Vercel setup, environment variables, pre-deploy checks, and common deployment errors.

## Contribution

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md).

The architecture overview is available in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Issue Ideas

See [docs/ISSUES.md](./docs/ISSUES.md) for contributor-ready GitHub issue ideas.

## Create GitHub Issues

Use GitHub CLI to publish every roadmap item from `docs/ISSUES.md` into the repository Issues tab:

```bash
gh auth login
npm run issues:dry-run
npm run issues:create
```

The script skips issues with titles that already exist and creates labels such as `area:frontend` and `difficulty:advanced`.
