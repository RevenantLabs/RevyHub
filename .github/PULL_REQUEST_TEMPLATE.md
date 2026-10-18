## Summary

Describe what changed and why. One pull request must implement exactly one
issue and one independent feature slice.

## Scope proof

Issue: Closes #

Feature directory: `features/<slug>/`

Changed file count:

```bash
git diff --name-only origin/main...HEAD | wc -l
```

- [ ] This pull request changes at least 20 meaningful files (the scaffold normally creates 23)
- [ ] Every product change is inside the feature directory above
- [ ] This work does not require another open issue or unmerged pull request
- [ ] No generated registry file or shared navigation/route list was edited

## How to Test

Describe the exact happy path, one validation failure, one transport failure,
and the network(s) a reviewer should use.

1. Go to ...
2. Enter ...
3. See ...

## Evidence

Add screenshots for idle, loading, success and error states. Include the result
of the slice-specific contract check:

```bash
npm run verify:features -- <slug>
```

## Checklist

- [ ] `npm run check` passes locally
- [ ] Logic returns `Result<T, Code>` for every expected failure
- [ ] Every error code has actionable copy in `copy.ts`
- [ ] Idle, loading, success and error states are implemented
- [ ] Network requests are tested through MSW, not internal-module mocks
- [ ] Accessibility tests cover at least two states with zero WCAG 2.1 A/AA violations
- [ ] Amount arithmetic uses strings/`BigInt`, never floating point
- [ ] No secret key is accepted, rendered, stored, logged or transmitted
- [ ] `README.md` records the feature's non-obvious technical decision

## Follow-Up

Call out known limitations only. Do not make this pull request depend on future
work; anything required by the acceptance criteria belongs in this slice.
