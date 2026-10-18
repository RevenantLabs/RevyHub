# Effects Timeline Viewer

Shows the ledger effects an account experienced as a chronological timeline,
grouped by the transaction that caused them.

An operation states an intention; effects state what the ledger actually did,
including consequences the operation never named. A single path payment
operation, for example, produces a debit, a `trade` for every offer it crossed
and a credit — three effects from one requested action. The timeline says so in
words and points at a real example taken from the page in front of the reader,
rather than describing the idea in the abstract.

## How it works

One request: `GET /accounts/{id}/effects?order=desc&limit=21`.

Effect records carry no transaction hash, so the grouping is derived from the
effect id instead. A Horizon effect id is `<operation TOID>-<effect index>`,
and the operation TOID packs the ledger sequence into its high 32 bits, the
transaction's application order into the next 20 and the operation's position
into the low 12. Clearing the operation bits therefore yields a stable identity
for the transaction — no second request needed. All of that arithmetic is
`BigInt`: a TOID passes 2^53 at ledger ~2.1M, so `Number` would start merging
distinct transactions through rounding.

Groups keep Horizon's newest-first order, while the effects *inside* a group
run oldest first. That mixed ordering is deliberate: a chain of consequences
only reads correctly in the order the ledger applied it, but a history only
reads correctly newest first.

Balance changes and configuration changes are told apart by a written badge as
well as by a colour and a coloured rule, because colour alone carries no
meaning for a screen reader or for a reader who cannot distinguish the two hues.
`account_removed` is counted as a configuration change on purpose: an account
merge reports the lumens it moved separately as a debit and a credit, so
counting the removal as a balance change would count the same value twice.

Amounts never touch a float. `toStroops` concatenates digits rather than
multiplying, so `922337203685.4775807` — the largest amount Stellar can
represent — survives formatting exactly.

## The non-obvious decision: the page boundary

Effects are paged, but transactions are not, so the first group on an older
page is usually a continuation of the last group on the newer one. Three
options were available: over-fetch until the straddling transaction is complete,
silently split it, or split it and say so.

This tool **splits and says so**, and it detects the split rather than guessing
at it. Horizon is asked for `PAGE_SIZE + 1` records and only `PAGE_SIZE` are
rendered. The extra record is never shown; it exists to answer two questions
exactly: whether an older page exists at all, and whether the oldest
transaction on this page continues into it. When it does, the group is labelled
"this transaction continues on the next page", and the hook carries that
transaction id forward so the same group opens the older page labelled
"continued from the previous page".

Over-fetching was rejected because a transaction's effect count is unbounded:
completing the straddling group could mean an arbitrary number of extra
requests to render one page. Splitting silently was rejected because a reader
who sees three effects of a five-effect transaction, with no marker, will draw
a wrong conclusion about what the transaction did. A visible seam is honest and
costs one extra record per page.

Paging is a replay, not a guess: the hook stores the request that produced each
page, so "newer effects" re-issues a known cursor instead of reversing the sort.
Both buttons are always rendered and disabled at their end, so the control never
moves under the pointer and a screen-reader user hears why a button cannot be
used rather than finding it gone.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/effectsTimeline.ts` | Id parsing, classification, grouping, paging |
| `lib/effectsTimeline.errors.ts` | Horizon failures → this tool's codes |
| `lib/format.ts` | Amounts, assets, identifiers, timestamps |
| `hooks/useEffectsTimeline.ts` | Idle / loading / success / error, plus the cursor trail |
| `components/` | Form, result, pager, empty and error UI |
| `__tests__/` | Logic, schema, format, hook, component and accessibility tests |
| `fixtures/` | Seed-derived accounts and 23 effects across nine transactions |
| `msw/` | Request mocks, including both pages and every failure |

## Safety

This tool reads public ledger history and nothing else. It never asks for,
accepts, displays, stores or transmits a secret key: a value starting with `S`
is rejected on the prefix alone, before any checksum work, so a pasted seed
never reaches a request, the hook's state or the screen. Two tests assert
exactly that.
