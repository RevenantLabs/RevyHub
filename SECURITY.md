# Security Policy

RevyHubX is a developer utility for public Stellar workflows. It must never ask for private keys, seed phrases, or wallet recovery material.

## Supported Version

Security fixes target the `main` branch.

## Reporting

Open a private security advisory or contact the maintainers before publicly disclosing an issue that could expose users, wallet data, or deployment credentials.

## Maintainer Checks

Before release or deployment, maintainers should run:

```bash
npm audit --audit-level=moderate
npm run lint
npm run test
npm run build
```

## Scope

- Public key validation and public Horizon lookups are in scope.
- Friendbot usage is testnet-only and has no real asset value.
- The app does not store wallet keys or submit signed transactions.

## Security Headers

All pages are served with the following security headers:

| Header | Value | Environment |
|---|---|---|
| `Content-Security-Policy` | Restrictive baseline (see `README.md`) | all |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | production only |
| `X-Frame-Options` | `DENY` | all |
| `X-Content-Type-Options` | `nosniff` | all |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | all |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | all |
| `Cross-Origin-Opener-Policy` | `same-origin` | all |
| `Cross-Origin-Resource-Policy` | `same-origin` | all |

The `Content-Security-Policy` uses `'unsafe-inline'` for `script-src` and `style-src` because Next.js injects inline runtime scripts and styles. Moving to a nonce-based approach would improve this baseline.

### Required External Origins (connect-src)

| Origin | Purpose | Configurable |
|---|---|---|
| `https://horizon-testnet.stellar.org` | Horizon API (testnet) | `NEXT_PUBLIC_HORIZON_TESTNET_URL` |
| `https://horizon.stellar.org` | Horizon API (mainnet) | `NEXT_PUBLIC_HORIZON_MAINNET_URL` |
| `https://friendbot.stellar.org` | Friendbot faucet | Hardcoded (testnet-only) |
| *Soroban RPC* | Future Soroban support | `NEXT_PUBLIC_SOROBAN_RPC_URL` (when set) |

### Image Origins

All application images are served from `'self'`. QR codes use `data:` URIs. Additional image origins can be configured via `NEXT_PUBLIC_IMAGE_ORIGINS` (comma-separated).

### Development vs Production

- In development, HSTS is omitted so local HTTP works without certificate errors.
- CSP is identical in both environments because Next.js requires the same inline allowances regardless of mode.
- The CSP does **not** contain `*` or `unsafe-eval` in any environment.

### Verification

After a production build, run the header verification script to assert expected response headers:

```bash
npm run build
npm run verify:headers
```
