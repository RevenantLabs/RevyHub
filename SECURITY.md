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

## Secret-Key Input Guard

Public-identifier fields (e.g. address inputs) run a client-side guard that detects
likely Stellar secret seeds (56-character S-prefixed strings) before the value is
accepted or sent to any handler.

- The guard never logs, stores, copies, or displays the submitted secret value.
- When a secret seed is detected, the input is blocked and a warning is shown with
  rotation guidance but without exposing the key or any derived account information.
- Public G, M, C, transaction, and other supported identifiers are never falsely
  blocked.
- The underlying `detectSecretKey` function is exported from
  `lib/stellar/secretKeyGuard.ts` so future public-identifier fields can enable the
  same protection.
