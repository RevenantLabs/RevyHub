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

## Extending the Toolkit

To add a new tool end-to-end (utility, page, navigation metadata, tests, and error states), follow [docs/EXTENDING.md](./docs/EXTENDING.md).

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

This project includes [GitHub issue templates](.github/ISSUE_TEMPLATE/) to help structure contributions:
- [Bug report](.github/ISSUE_TEMPLATE/bug_report.md) — for reporting broken workflows or UI states
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md) — for proposing new Stellar tools or improvements
- [Documentation](.github/ISSUE_TEMPLATE/documentation.md) — for suggesting doc or guide updates
- [Pull request](.github/PULL_REQUEST_TEMPLATE.md) — for submitting your changes

## Pull Requests

PRs should include:

- What changed
- Why it changed
- How you tested it
- Screenshots for UI changes
- Any follow-up TODOs

The pull request template also asks contributors to confirm lint, tests, the production build, documentation updates, and relevant loading or error states.

Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.md), [feature request](.github/ISSUE_TEMPLATE/feature_request.md), or [documentation](.github/ISSUE_TEMPLATE/documentation.md) template when opening issues, and the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) when submitting changes.

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
