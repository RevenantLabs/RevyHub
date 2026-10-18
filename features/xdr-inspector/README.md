# Transaction XDR Inspector

Decodes a base64 transaction envelope in the browser and reports what it
actually contains.

## How it works

The pasted text goes through `schema.ts` before it reaches the decoder. That
ordering is deliberate: rejecting non-base64 up front is what lets the UI
separate *"you pasted the wrong thing entirely"* from *"this is base64, but not
a transaction envelope"* — two problems with completely different fixes. A
64 KiB cap keeps a pasted file from locking the main thread inside `fromXDR`.

All three envelope variants are handled — `v0`, `v1` and fee bump. For a fee
bump, the summary describes the **inner** transaction, because that is the one
that will actually execute; the outer wrapper (who pays, how much, how many
signatures) is reported in its own section rather than mixed into it.

An expired transaction is a normal result, not an error. The bounds decoded
fine; they simply describe a window that has closed, so it is reported as a
warning alongside the full summary.

## What this tool will not do

Signatures are **counted, not verified**. An envelope carries no network
passphrase, so the same XDR produces a different signature base on testnet and
mainnet — verification is impossible without knowing which network it was built
for, and claiming otherwise would be worse than saying nothing.

The tool also never offers to sign or submit. An envelope handed over by a
stranger is exactly the social-engineering path this tool exists to let you
inspect *before* trusting it, and a convenient "sign this" button would defeat
the whole purpose.

Nothing is transmitted, logged or persisted: `msw/handlers.ts` is empty by
design.

## Fixtures

Envelopes are built with the SDK from fixed raw seeds rather than hard-coded
base64, so every fixture is genuinely well-formed and identical on every
machine.
