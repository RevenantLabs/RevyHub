# Transaction Envelope Difference Viewer

Compares two transaction envelopes field by field, so a reviewer can see
whether a wallet changed a destination, an amount, a source or a fee — instead
of comparing two opaque base64 strings by eye.

## How it works

Each envelope is decoded and flattened into a map of **stable dotted field
paths** (`tx.operations[0].amount`, `outer.maxFee`, `tx.signatures[1].hint`),
and the two maps are compared key by key. A path present on only one side is
`added` or `removed`; a path on both with different values is `changed`.
Everything else is `unchanged` and still available behind a filter, because
"this field did *not* move" is often exactly what a reviewer needs to confirm.

Values are stringified, never passed through `Number`. Stellar amounts arrive
from the SDK as decimal strings and sequence numbers as integer strings;
coercing either would round away precisely the digits being checked. There is a
fixture whose only difference is the seventh decimal place.

## The non-obvious decision

**Every operation also carries its canonical XDR as a field of its own.**

The readable fields come from the SDK's operation model, which is what makes
`tx.operations[0].amount` legible. But that model only exposes what it knows
about — so a field this tool does not name would be compared as *nothing*, and
two genuinely different envelopes could be reported as identical. That is the
worst possible failure for a review tool: silence that looks like a pass.

So alongside the named fields, each operation contributes
`tx.operations[i].xdr`, the operation's own canonical base64. Any difference
whatsoever — a field added by a future protocol version, an extension this
slice does not model, anything at all — shows up there. The named fields make
the common case readable; the XDR field makes the uncommon case *impossible to
miss*.

## Operations are compared by position

A reordering is a change. The tool does not try to match operations up by
content and report "these two moved", because the ledger applies operations in
order: the same operations in a different order are a different transaction,
and describing that as "no change, just reordered" would be wrong.

## Signatures are their own section

A re-signed but otherwise identical envelope is a completely different review
outcome from one whose amount moved, so signature fields live in their own
section and the summary carries a `signaturesOnly` flag. When it is set the UI
says so explicitly — that is usually the *expected* result of sending an
envelope away to be signed, and a reviewer should be able to confirm it at a
glance rather than reading rows.

## Fee-bump layers stay apart

`outer.*` and `inner.*` are separate path prefixes, so a change to the wrapper
is never reported against the transaction that executes. A test raises only the
fee bid and asserts that no `inner.` path moved.

## Each side gets its own error

`invalid_left_xdr` and `invalid_right_xdr` are separate codes. A reviewer
comparing a wallet's output against their own almost always has exactly one of
them wrong, and "one of these is invalid" is not something you can act on. The
before envelope is checked first so the message names one concrete thing to
fix.

A missing passphrase is `empty_input`, not an XDR error — both envelopes may be
perfectly fine, and the SDK simply cannot decode without knowing which network
they were built for.

## Export

The JSON summary lists only the changes, in the same stable sorted order, with
no timestamp — so the same pair of envelopes produces byte-identical output.
Index-aware sorting keeps `operations[2]` before `operations[10]`. Nothing is
uploaded: `msw/handlers.ts` is empty by design.

## Fixtures

Each fixture is exactly one edit away from the same base envelope — one amount,
one destination, one memo, a swap of two operations, an extra operation, one
signature, a higher fee bid — so the tests assert a *precise set of changed
paths* rather than a count.
