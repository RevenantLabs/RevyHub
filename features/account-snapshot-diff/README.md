# Account Snapshot Difference Viewer

Compares two saved Horizon account resources offline, so a pair of snapshots
stays useful even when the endpoint they came from is unavailable — or the
network is gone entirely.

## The non-obvious decision

**Arrays are matched by identity, never by position.**

Horizon makes no ordering guarantee for `balances` or `signers`. Comparing them
element by element would report a movement every time the order shifted, and a
tool that cries wolf on every refresh is worse than no tool: the real change
gets lost in the noise.

So each snapshot is flattened into a map keyed by *what the entry is* rather
than *where it sat* — balances by full asset identity, pool shares by pool ID,
signers by key, data entries by name. Reversing both arrays produces a diff with
zero changes, and there is a test for exactly that.

"Full asset identity" is the other half of it. Two different issuers can and do
use the same four letters, so the key is `CODE:ISSUER`, never the code alone.
Matching on the code would silently compare one asset's balance against a
completely different asset's — a wrong answer that looks like a right one. A
fixture adds a second `USDC` from a different issuer to keep that honest.

## Absent is not zero

A field that disappeared is `removed`, with `null` on the after side and **no
delta**. A field that became `"0"` is `changed`, with a delta.

These are different events. A trustline whose `limit` vanished is not a
trustline whose limit became zero, and defaulting a missing field to `0` — the
convenient thing — would erase that distinction in exactly the cases someone is
investigating. The UI renders absence as an em dash and never as a number.

## Amounts are exact

All arithmetic goes through `BigInt` over stroops. Two of the fixtures differ by
one stroop at a magnitude where `Number` collapses both values to the *same*
float; a test asserts that collapse happens and that the tool reports the
one-stroop delta anyway.

Deltas always carry a sign, so an increase is never read as a total.

## It compares observations, not history

These are two documents someone pasted. This tool does not infer what happened
between them, does not fabricate or read timestamps to order them — they are
"before" and "after" because the user pasted them that way — and never contacts
Horizon. The UI says so on screen, not only here.

It also refuses to guess when the two documents describe different accounts:
`account_mismatch` is its own error code, because comparing two accounts
produces differences that mean nothing at all.

## Unsupported fields are surfaced

Any top-level field present in either snapshot that this tool does not model is
listed in a visible notice. Horizon envelope noise (`_links`, `id`,
`paging_token`) is excluded from that list, since it is not account state.

A comparison that quietly ignores fields is not a complete audit, and must not
look like one — so the gap is stated rather than hidden.

## Export

The JSON summary lists only the changes, in a stable sorted order, with no
timestamp, so the same pair produces byte-identical output. The snapshots
themselves are **not** copied into it and are not stored anywhere; a test
asserts the export contains neither `_links` nor `home_domain`.

A pasted secret seed is refused — matched anywhere in the text, since a seed in
a snapshot would be embedded in JSON rather than pasted alone — and the field is
then cleared by remounting the form.
