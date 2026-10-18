# Claimable Balance Claim Readiness

Evaluate whether a named claimant appears eligible to claim one existing
claimable balance at a chosen UTC time. The tool shows the predicate tree and
explains each branch without claiming to simulate a submitted transaction.

## How it works

Horizon exposes a single balance as `GET /claimable_balances/{id}`. This tool
validates the balance ID and claimant address locally, fetches that resource,
then evaluates the selected claimant's predicate against the user-chosen UTC
instant.

Supported predicate shapes: `unconditional`, `abs_before`, `abs_after`,
`rel_before`, `rel_after`, `and`, `or` and `not`. Nested trees are normalized in
`lib/predicate-tree.ts` and evaluated branch-by-branch in `lib/claim-evaluator.ts`.

Relative predicates use the balance `last_modified_time` as creation context.
When that timestamp is missing or unparseable, the result is **indeterminate**
rather than a false yes/no — guessing would be worse than admitting uncertainty.

An address that is simply not listed among claimants is reported as
**not a claimant**, which is distinct from a missing balance (`balance_not_found`).

## Safety

Read-only. No claim operation is built, signed or submitted. Secret keys are
never accepted.
