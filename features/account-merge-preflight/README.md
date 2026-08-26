# Account Merge Preflight Check

Checks whether a Stellar source account can currently be merged into a chosen
destination and names every blocker visible through the required Horizon
account and offer endpoints. It is a read-only diagnostic: it never builds,
signs, or submits an account-merge transaction.

## How it works

After validating two checksum-correct public `G...` addresses, the slice reads:

1. `GET /accounts/{source}`
2. `GET /accounts/{destination}`
3. every page of `GET /accounts/{source}/offers?limit=200`

The source is fetched first so a 404 is reported against the source field. The
destination is fetched separately and gets its own field-level 404. Identical
addresses are rejected before the first request. Requests share an abort signal
and a 12-second timeout; a second submission or reset supersedes older work.

The result always includes an eight-row checklist covering destination
existence, trustlines/pool shares, offers, data entries, sponsorship
obligations, signer authorization, immutable authorization, and destination
capacity. Failed rows are backed by concrete blocker records such as the full
`CODE:ISSUER` trustline identity, offer ID and asset pair, data-entry name, or
configured versus required signer weight.

Offer pagination is not optional: Horizon pages at 200 records while an account
may have many more subentries. The loader follows stable paging tokens until a
short page, rejects repeated cursors, and applies a protocol-sized safety bound.

## Non-obvious protocol decisions

Additional signers are subentries, but Stellar Core removes them during a
successful account merge; their mere presence is not a blocker. Authorization
is the real question. `accountMerge` uses the account's high threshold, so the
tool sums all configured signer weights and checks whether that total can meet
the threshold. The eventual transaction must still provide signatures whose
weights reach it.

Sponsorship has a similar asymmetry. `num_sponsoring` means the source pays
reserves for other entries and blocks deletion. `num_sponsored` means somebody
else pays reserves for source-owned entries; it is shown for context but does
not by itself block merge.

`AUTH_IMMUTABLE` is permanent and blocks account merge. Destination capacity is
also checked exactly in stroops using the same upper bound enforced by Core:

```text
INT64_MAX - destination XLM balance - destination XLM buying liabilities
```

No XLM value is converted to a JavaScript float. Decimal strings are parsed to
`BigInt` stroops and formatted back with seven decimal places. The displayed
transfer is the source's current Horizon balance; fees and ledger changes that
happen after this snapshot can change the eventual operation result.

## Result and error model

Expected failures return `Result<T, Code>` and never rely on English error
parsing. Input and lookup failures stay attached to the responsible field:

| Code | Meaning |
| --- | --- |
| `empty_source` / `invalid_source` | Correct the source public address |
| `empty_destination` / `invalid_destination` | Correct the destination public address |
| `same_account` | Choose another destination before any request |
| `source_not_found` | Source is absent on the selected network |
| `destination_not_found` | Destination is absent on the selected network |
| `request_failed` | Horizon 5xx, malformed response, transport failure, or timeout |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

Only public account data is requested. An `S...` secret seed is rejected on its
prefix before checksum validation, is never put into hook state or error copy,
and is never transmitted. The feature does not offer automatic trustline
removal, offer cancellation, sponsorship changes, transaction construction, or
submission.
