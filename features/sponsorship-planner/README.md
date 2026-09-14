# Sponsorship and Reserve Planner

Plans a sponsored account setup: which subentries a sponsor would cover, the
reserve that costs the sponsor, and what the sponsored account is left needing.
Both accounts are read from Horizon (`GET /accounts/{id}`), and the base
reserve comes from the latest ledger. A missing sponsored account is the normal
sponsorship case, so it is treated as a plan input — only a missing sponsor is
an error.

## How it works

The plan makes the sponsor responsible for every unsponsored entry on the
sponsored account:

- a **new** sponsored account has no entries yet, so the plan covers just its
  account entry (two reserve units) via a sponsored `create_account`;
- an **existing** sponsored account is itemised from its trustlines, signers
  (excluding the master key, which is not a subentry), data entries, offers and
  claimable balances, and the unsponsored ones are planned at one reserve unit
  each. Entries that already have a sponsor are listed as "already sponsored"
  and left untouched.

All reserve arithmetic stays in integer stroops via `BigInt`:

```text
sponsor current minimum  = base × (2 + subentry_count + num_sponsoring − num_sponsored)
sponsor resulting minimum = sponsor current minimum + planned units × base
sponsor shortfall          = max(0, resulting minimum − sponsor balance)
sponsored still needs      = max(0, sponsored current minimum − planned cost)
```

The result also names the amount the sponsored account still needs and, in the
**operation order** card, the begin/end sponsorship sandwich the plan implies:
`begin_sponsoring_future_reserves` … the ops that create each planned subentry
… `end_sponsoring_future_reserves`. Operations outside the sandwich are not
sponsored, which is exactly why the order is shown.

## The non-obvious decisions

**A missing sponsored account is a plan input, not an error.** Sponsorship is
how an application onboards users without funding each account, so the account
being sponsored usually does not exist yet. Only a missing *sponsor* is
reported as `sponsor_not_found`. The 404 on the sponsored account is caught
inside the logic, never by the error mapper.

**Data-entry sponsorship is reconstructed from effects.** Horizon's account
`data` object exposes only names and base64 values — no sponsor. The only way
to learn who sponsors a data entry is to replay the account's
`data_sponsorship_*` effects newest-first. That walk is bounded (five pages)
and skipped entirely when `num_sponsored` is zero, because at zero no entry can
be sponsored. The first effect mentioning an entry decides it, and a
`data_removed` counts as a decision so a deleted-and-recreated entry does not
inherit the dead entry's sponsor.

**Claimable balances are read by claimant.** Horizon exposes claimable balances
by claimant and by sponsor, not by creator, so there is no filter that returns
exactly the balances an account created. The tool uses the claimant list — the
same source as the `claimable-balances` tool — as the account's claimable
balances and plans the ones without an existing sponsor.

**Existing account entries are not planned.** Sponsoring the entry of a live
account requires merging and recreating it, which is outside this tool's scope
(it never builds or revokes sponsorship operations). For an existing account
the plan covers its unsponsored subentries only, and its own entry reserve is
reported as part of what it still needs.

## Error codes

| Code | Cause |
| --- | --- |
| `empty_sponsor` / `invalid_sponsor` | Sponsor rejected locally before a request |
| `empty_sponsored` / `invalid_sponsored` | Sponsored account rejected locally before a request |
| `same_account` | Sponsor and sponsored are the same address |
| `sponsor_not_found` | Horizon returned 404 for the sponsor |
| `ledger_unavailable` | The latest ledger had no usable base reserve |
| `rate_limited` | Horizon returned 429 |
| `request_failed` | Horizon 5xx, timeout or transport failure |

## Safety

This tool reads public ledger data only. Input starting with `S` is rejected on
the prefix, before any checksum check, so a pasted secret seed is never
validated, echoed, stored or transmitted. It never accepts, builds or submits a
sponsorship transaction and never revokes an existing sponsorship.
