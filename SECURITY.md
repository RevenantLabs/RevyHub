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


## Browser Security Headers

RevyHubX configures browser security headers for every route in `next.config.mjs`, including Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HTTP Strict Transport Security, and Cross-Origin Opener Policy.

The production CSP permits network connections only to this app, the configured Stellar Horizon testnet and mainnet origins, and the configured Friendbot origin. Keep these origins environment-aware through `NEXT_PUBLIC_HORIZON_TESTNET_URL`, `NEXT_PUBLIC_HORIZON_MAINNET_URL`, and `NEXT_PUBLIC_FRIENDBOT_URL`; do not replace them with wildcard hosts. Development mode adds localhost connection sources and `unsafe-eval` for Next.js tooling, but those relaxations are not emitted for production builds.

When adding external services, document the exact origin here and in `README.md`, add it to the CSP builder, and extend `tests/securityHeaders.test.ts` so production headers stay auditable.
