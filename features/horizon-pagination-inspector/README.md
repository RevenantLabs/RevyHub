# Horizon Pagination Response Inspector

Reads a pasted Horizon collection response and explains what its paging state
actually is: record count, the next and previous links, their cursor tokens,
paging token order, and any duplicate or missing identifiers.

It makes no request and transmits nothing, so the response never leaves the
machine it was read on.

## The decision this slice exists to make

**A short page is not evidence of an ending.**

The tempting reading of a page holding fewer records than the requested limit
is "that was the last one". Horizon does not work that way. A short page has
several innocent causes — a bounded range, a filtered view, records that moved
between reads — so page length carries no paging information at all. The only
signal worth reading is whether a next link is present.

This slice therefore reports three distinct things rather than one verdict:

| What was observed | What is reported |
| --- | --- |
| A next link is present | More pages may follow |
| Links are present, no next link | This response describes the end of what it queried |
| No _links object at all | Nothing is established either way |

That third row is the one most tooling collapses into the second. A response
with no links object is a response whose paging state is simply unknown, and
saying "you have reached the end" about it would be a fabricated conclusion.

## Cursors are opaque

Cursor tokens are compared for equality and copied verbatim. They are never
added to, subtracted from, or parsed as numbers. A cursor is a token a server
issued; the only operations that are sound on it are "pass it back unchanged"
and "ask whether it equals another token".

The link reader in lib/horizonPaginationInspector.ts splits a query string by
hand rather than through URL, because the tool's job is to report what the link
says, not to normalise it into something the server did not send. A malformed
percent-escape is shown verbatim instead of throwing, since the raw form is
still what actually arrived.

## Paging tokens are not JavaScript numbers

Paging tokens are decimal strings that routinely exceed
Number.MAX_SAFE_INTEGER. They are compared with BigInt. Two tokens one apart,
four quintillion into the space, compare as *equal* under Number() — which
would silently invert the ordering this tool exists to report. A test asserts
exactly that, so a future rewrite to Number fails loudly rather than subtly.

## Why the schema does not normalise whitespace

normalizeInput from @/core/lib/strings collapses runs of whitespace, which is
right for short identifiers and wrong for a JSON document: it would rewrite the
contents of every string value containing a repeated space before parsing.
schema.ts trims only, and a test pins that behaviour.

## Files

| Path | Responsibility |
| --- | --- |
| manifest.ts | Registry metadata — offline, networks: [] |
| types.ts | This slice's types and error codes |
| schema.ts | Raw paste to validated input; size cap |
| lib/horizonPaginationInspector.ts | Link reading, record analysis, token ordering |
| lib/horizonPaginationInspector.errors.ts | Input-vs-shape classification |
| lib/format.ts | Presentation helpers and the paging-evidence rules |
| hooks/useHorizonPaginationInspector.ts | idle / success / error |
| components/ | Form, result, empty state, panel |
| __tests__/ | Logic, schema, formatting, hook, component, axe |
| fixtures/ | Envelopes built from fixed values |
| msw/ | No handlers — this slice makes no request |

## States

There is no loading state because there is no asynchronous work: reading is two
synchronous pure functions over a string. Adding one would put a fake delay in
front of JSON.parse.

## Safety

This tool never asks for, displays, stores or transmits a secret key, and it
never signs or submits a transaction. It is read-only by construction: the
input is a document, and the output is a description of it.
