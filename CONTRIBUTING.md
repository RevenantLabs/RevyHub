# Contributing

Thanks for helping improve RevyHubX. This project is intentionally modular so contributors can pick focused Stellar, UI, testing, or documentation tasks.

## Clone and Install

```bash
git clone https://github.com/RevenantLabs/RevyHubX.git
cd RevyHubX
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Branch Naming

Use short, descriptive branch names:

- `feature/payment-uri-validation`
- `fix/friendbot-error-state`
- `docs/vercel-guide`
- `test/address-validator`

## Commit Style

Prefer clear conventional-style commits:

- `feat: add trustline checker`
- `fix: handle account not found state`
- `docs: add Vercel deployment guide`
- `test: cover address validation`

## Pick an Issue

Pick an issue from [docs/ISSUES.md](./docs/ISSUES.md) that matches your experience level, then comment on it before starting larger work. Bug report, feature request, and documentation templates are available under `.github/ISSUE_TEMPLATE/`.

## Pull Requests

Use the pull request template at `.github/PULL_REQUEST_TEMPLATE.md` when opening a PR.

## Code Quality

- Keep tools modular under `app/tools/*`
- Put Stellar API logic under `lib/stellar/*`
- Reuse components from `components/ui` and `components/stellar`
- Do not ask users for secret keys, seed phrases, or private keys
- Keep testnet-only behavior clearly labeled

## Testing Expectations

Run these before opening a PR:

```bash
npm run lint
npm run test
npm run build
```

Unit tests are available for core Stellar utilities. E2E tests remain a roadmap item. If you add or change tests, keep the README and CI workflow aligned.

## Asking for Help

Open a GitHub issue with context, screenshots when relevant, and the exact command or workflow that failed.
