# Publishing contributor issues

RevyHubX issues are product specifications for external contributors. The
maintainer prepares and publishes them; contributors implement them. An issue
must never be pre-solved in the repository before it is offered.

## Release policy

- Issues are released in batches of exactly five.
- The first wave contains 20 advanced issues with stable positions 1–20.
- Later issues are labelled medium.
- At least 40 independent, unimplemented issues must remain available. CI
  rejects the catalogue if capacity drops below that number.
- Every issue creates one new `features/<slug>/` directory and changes at least
  20 meaningful files. The standard scaffold creates 23 without padding.
- No issue may require another issue, branch or pull request to land first.

The stable wave order lives in `scripts/issue-status.mjs`. Detailed product
requirements live in `scripts/issue-catalog.mjs`.

## Preview the next batch

```bash
npm run verify:issues
npm run issues
node scripts/create-issues.mjs --json > next-five.json
```

The JSON contains the exact title, Markdown body, labels, wave position and
slug for each issue. Review all five payloads before publishing.

## Publish through GrantFox

Direct GitHub publishing is intentionally disabled. For each reviewed payload:

1. Call GrantFox `prepare_issue` with the RevyHub repository ID.
2. Show the exact returned preview to the maintainer.
3. Publish that draft with its `draft_id` and `approved_hash`.
4. Confirm the issue appears in both GrantFox and GitHub before preparing the
   next batch.

This flow is required because a GitHub issue created outside GrantFox is not
automatically available for GrantFox contributor assignment.

## Independence test

An issue is independent only when all of these are true:

- its pull request touches `features/<slug>/` and no other feature directory;
- its reference implementation already exists on `main`;
- routing, navigation and search require no manual registration;
- its acceptance criteria can be completed without another open issue;
- its fixtures, mocks, tests, copy and documentation live inside the slice.

`npm run verify:features -- <slug>` enforces the structural part. Reviewers
enforce the behavioural part using the pull request template.
