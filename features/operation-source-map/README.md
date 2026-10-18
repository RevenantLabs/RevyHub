# Transaction Operation Source Map

Shows which account supplies the source for every operation in an envelope, and
which operations quietly override the transaction source.

## How it works

`sourceAccount()` on an XDR operation is optional. When it is absent the
operation inherits the transaction's source; when it is present it overrides
it. That absence is the entire subject of this tool, so it is recorded rather
than resolved away: every row carries its `explicitSource` (possibly `null`),
its `effectiveSource`, and an `inherited` flag, so a reader can see not just
*who* authorizes an operation but *why*.

Rows are then grouped by effective source in first-appearance order, which
keeps the groups lined up with the envelope in front of you and makes the JSON
export stable.

## The non-obvious decision

**Muxed addresses are grouped as themselves, never flattened to their base
account.**

An `M…` address carries a 64-bit ID on top of a `G…` account. It is tempting to
resolve it away so that everything belonging to one "real" account lands in one
group — and that would be wrong. The protocol treats two `M…` addresses over
the same `G…` account as two different sources, and an exchange or custodian
using muxed accounts is relying on exactly that distinction. Merging them would
produce a map that disagrees with the ledger about who authorizes what.

So the exact address the envelope carries is the grouping key, and the
underlying `G…` account and muxed ID are reported as extra rows beside it. The
fixtures include two muxed addresses sharing one base account specifically so a
regression toward flattening fails a test.

## The fee payer is not an operation source

In a fee-bump envelope the operations belong to the **inner** transaction, so
the inner source is the inherited default. The fee source pays and authorizes
nothing.

Reporting the fee source as the inherited default would be the single most
misleading thing this tool could do, so it lives in its own `feePayer` field,
is labelled separately in the UI, and is excluded from the groups. Two tests
assert it never appears as any operation's effective source and never turns up
in a group.

## The filter is a view, not a copy

The inherited/overridden filter is derived during render from the map and the
current choice, rather than stored as a second list beside it. A stored copy
can drift out of sync with the map it came from; a derived one cannot.

Submitting a new envelope resets the filter. Carrying it over would show an
empty table for a map that is not empty at all — the user would be looking at
the consequence of a choice they made about a different envelope.

## Scope

An effective source is a **structural** property of the envelope. This map does
not evaluate signatures, signer weights or thresholds, and it does not
enumerate Soroban authorization entries — those live inside the operation
payload rather than in its source field, and claiming to have listed them would
be actively dangerous. The UI says so on screen, not just here.

## Export

The JSON summary is generated locally with a fixed key order and no timestamp,
so the same envelope produces byte-identical output every time. Nothing is
uploaded: `msw/handlers.ts` is empty by design.

## Secret keys

A pasted secret seed is refused on the `S` prefix alone, before any decoding,
so it never reaches the mapper or hook state. Refusing it is not quite enough
though — a textarea keeps showing whatever was typed into it. So the schema
tags that one rejection with a `secret_key` detail (the reason, never the
value), the hook counts those rejections, and the panel keys the form on that
counter, remounting it and wiping the field. Every other bad paste is left
alone, because clearing a user's input on an ordinary typo would be hostile.

## Fixtures

Built with the SDK from fixed raw seeds: a mixed envelope, one with no
overrides, one where every operation overrides, a muxed set, a fee bump, a v0
envelope and a v1 envelope with an empty operations vector — the last two
assembled at the XDR level because the builder will not produce them.
