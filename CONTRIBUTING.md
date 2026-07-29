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

Start with [docs/ISSUES.md](./docs/ISSUES.md). Choose an issue with a difficulty level that matches your experience, then open a GitHub issue or comment on an existing one before starting larger work.

<!-- TODO(issue #18): Add GitHub issue templates and link them from this section once .github/ISSUE_TEMPLATE exists. -->

## Pull Requests

<!-- TODO(issue #19): Add a pull request template and document the required PR checklist here. -->

PRs should include:

- What changed
- Why it changed
- How you tested it
- Screenshots for UI changes
- Any follow-up TODOs

GitHub issue and pull request templates are included under `.github/`.

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
npm run test:e2e
npm run build
```

Unit tests cover core Stellar utilities, and Playwright covers focused browser workflows with mocked network responses. If you add or change tests, keep the README and CI workflow aligned.

## Asking for Help

Open a GitHub issue with context, screenshots when relevant, and the exact command or workflow that failed.
