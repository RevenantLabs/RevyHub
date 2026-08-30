# Claimable Balance Explorer

Lists claimable balances for a claimant account or looks one up by ID, then
translates each claimant's predicate into a plain-language statement of who can
claim it and when.

## How it works

Horizon exposes claimable balances as `GET /claimable_balances?claimant={account}`
for lists and `GET /claimable_balances/{id}` for a single record. The list
endpoint is paginated; this tool walks every page so large claimant histories are
not silently truncated.

The predicate renderer is a pure recursive function over Horizon's JSON shape:
`unconditional`, `and`, `or`, `not`, `abs_before`, `abs_after`, `rel_before` and
`rel_after`. That function is where the value is — the fetch is straightforward.
Unit tests cover nesting at least three levels deep.

Relative predicates are evaluated against the balance's `last_modified_time`,
which Horizon returns on the resource. That timestamp matches creation time for
balances that have not been sponsored or otherwise updated since they were
funded.

Each claimant is marked **claimable now** or **not claimable now** by evaluating
its predicate against the current time. An unconditional predicate is described
as "can be claimed at any time" rather than shown as an empty object.

Switching the network clears the result instead of leaving a stale balance on
screen, because a balance that exists on testnet generally does not exist on
mainnet.

## Safety

Claimable balances are public ledger data. This tool is read-only; it never
builds, signs or submits a claim.
