# Contributing to RevyHubX

Thanks for building here. This project is organised so that many people can
work at the same time without ever colliding — please read
[docs/FEATURE_CONTRACT.md](./docs/FEATURE_CONTRACT.md) before you start.

## Setup

```bash
git clone https://github.com/RevenantLabs/RevyHub.git
cd RevyHub
npm install          # also generates the feature registry
npm run dev
```

## Adding a tool

Almost every open issue asks for a new tool. Scaffold it:

```bash
npm run new:feature -- ledger-lookup "Ledger Lookup" transactions
```

That creates `features/ledger-lookup/` with all 23 required files, already
compiling and passing its own placeholder tests. Your job is to replace the
placeholders with the real tool.

Then:

```bash
npm run registry            # picks up the new slice
npm run dev                 # it is already in the nav and at /tools/<slug>
npm run verify:features -- ledger-lookup
```

**You should not need to edit any file outside `features/<slug>/.`** Routing,
navigation, the dashboard and search all read a generated registry. If you find
yourself editing a shared file, that is a signal something is off — say so on
the issue instead of working around it.

## Before opening a pull request

```bash
npm run check
```

This runs the registry generation, ESLint, the full test suite, the feature
contract check and a production build. CI runs exactly the same thing.

## What reviewers look for

- Error codes specific enough to give the user real advice
- All user-facing text in `copy.ts`
- Amounts handled as strings and `BigInt`, never floats
- All four UI states present: idle, loading, success, error
- `a11y.test.tsx` clean in at least two states
- Fixtures derived from fixed seeds, not hand-typed addresses
- Requests mocked with MSW, not `vi.mock`
- **No secret key ever accepted, displayed, stored or transmitted**

## Commits and pull requests

- One tool per pull request. Link the issue it closes.
- Conventional commit prefixes: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- Describe the decisions you made, not just the files you touched. The
  interesting part of a review is *why* an error code exists, not that it does.

## Security

RevyHubX is read-only by design. It never asks for a secret key and never signs
or submits a transaction. If a change would break that, it does not belong
here. See [SECURITY.md](./SECURITY.md).
