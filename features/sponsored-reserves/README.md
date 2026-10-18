# Sponsored Reserves Inspector

Shows the reserve units sponsored for a Stellar account, the units that account
sponsors for others, and the resulting minimum-balance change in XLM. The
sponsored account entry, trustlines, signers, offers and data entries are
normalised into one accessible table with a copyable sponsoring account.

## How it works

Horizon carries a `sponsor` field on five different shapes with five different
sets of surrounding fields: the account record itself, balances, signers, offer
records and — indirectly — data entries. `normalizeSponsoredEntries` collapses
all of them into a single `SponsoredEntry` row, the way `normalizeBalance` does
in `features/balance-viewer`, so the table has one row shape and one sort order.

`num_sponsored` and `num_sponsoring` count reserve *units*, not table rows: a
sponsored account entry is worth two units and every other entry one. The net
effect is therefore calculated from the counts rather than from the rows:

```text
(num_sponsored - num_sponsoring) × base_reserve_in_stroops
```

That calculation and its XLM formatting use `BigInt` and strings exclusively —
never `Number`. Positive values are reserve relief; negative values are an added
obligation.

Switching the network in the header clears the result, because the same address
has different sponsorship on testnet and mainnet. A request counter and an
`AbortController` discard responses that a newer request or a network switch
superseded.

## The non-obvious decision

Horizon's account `data` object contains only names and base64 values — no
sponsor. The only way to learn who sponsors a data entry is to replay that
account's `data_sponsorship_*` effects, and effects are history, not state.

Walking history could be unbounded, so it is bounded twice:

1. **It is skipped entirely when `num_sponsored` is 0.** At zero, no offer and
   no data entry can be sponsored, so both follow-up requests are provably
   pointless. The same gate skips the offers request.
2. **Effects are read newest-first with a page budget.** The first effect that
   mentions an entry decides it, so a resolved entry is never looked up again;
   an entry that has *never* been sponsored produces no effect at all, which is
   exactly the case a cap is needed for.

A `data_removed` counts as a decision too. Without it, an entry deleted and
recreated under the same name would inherit the dead entry's sponsor.

The account's own `num_sponsoring` obligations are reported as a count and an
XLM figure rather than as rows. The individual entries it sponsors live on
*other* accounts, and enumerating them means following the sponsor chain
outward — explicitly out of scope for this tool.

## Error codes

| Code | Cause |
| --- | --- |
| `empty_input` / `invalid_address` | Rejected locally before a request |
| `account_not_found` | Horizon returned 404 on the selected network |
| `rate_limited` | Horizon returned 429 |
| `request_failed` | Horizon 5xx, malformed data, timeout or transport failure |

## Safety

This tool reads public ledger data only. Input starting with `S` is rejected on
the prefix, before any checksum check, so a pasted secret seed is never
validated, echoed, stored or transmitted. The tool never creates or revokes a
sponsorship.
