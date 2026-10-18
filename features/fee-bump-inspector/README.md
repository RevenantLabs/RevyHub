# Fee-Bump Envelope Inspector

Decodes a fee-bump transaction envelope in the browser and reports its two
layers separately: the wrapper that pays, and the transaction that executes.

## How it works

A fee bump has two authorization layers, and almost every mistake made while
reading one is a mistake about *which layer* a value belongs to. So the report
never merges them. The outer section carries the fee source, the maximum fee
bid, the outer hash and the outer signature vector. The inner section carries
the inner source, sequence, operations, inner fee bid, inner hash and inner
signature vector. Nothing is inherited across the boundary.

Both hashes are computed with the installed SDK from the passphrase the user
picks, and each copy action is labelled with the layer it returns — `Copy outer
transaction hash` and `Copy inner transaction hash` — so a copied hash is never
ambiguous.

## The non-obvious decision

**The envelope variant is read from the raw XDR before the SDK wrapper is
built.** `xdr.TransactionEnvelope.fromXDR` is called first, its discriminant is
checked, and only then is `FeeBumpTransaction` constructed.

Doing it the other way round — handing an ordinary envelope straight to
`FeeBumpTransaction` — produces a throw that is indistinguishable from genuinely
corrupt bytes. Both would end up as "malformed XDR", which is wrong and
unhelpful: a v1 envelope is completely valid, the user simply opened the wrong
tool. Reading the discriminant first is what lets that case return
`not_fee_bump` and be announced as a notice (`role="status"`) rather than an
error, with a pointer to the tool that does read ordinary envelopes.

The same ordering gives v0 envelopes the same treatment, which matters because
they reach the decoder through a different discriminant entirely.

## Why the passphrase is its own input

A transaction hash is derived from the network passphrase, so the same envelope
hashes differently on testnet and mainnet. An envelope does not carry its
passphrase, which means the hash cannot be computed without asking. Rather than
guessing a default and quietly producing a hash for the wrong network, the
passphrase is a required field with the standard networks offered and a custom
escape hatch, and the passphrase actually used is echoed back in the result.

A missing passphrase is therefore `empty_passphrase`, not an XDR error — the
envelope may be perfectly fine.

## Fee bid versus charged fee

The outer amount is a **bid**, not a charge. The network charges a fee bump for
every inner operation *plus one* for the wrapper itself, at the inclusion fee
decided when the transaction lands in a ledger. That number is not in the
envelope, so this tool does not estimate it: it shows the bid, the operation
count it is spread across (`operations + 1`), and the resulting per-operation
ceiling. The inner fee bid is shown too, with the note that it no longer pays
for anything once the transaction is wrapped.

All of that arithmetic is `BigInt`. A maximum fee is a 64-bit stroop count and
routinely exceeds `Number.MAX_SAFE_INTEGER`; the fixtures include a 1.2e16
stroop bid specifically so a float regression would fail a test.

## What this tool will not do

Signatures are **counted, not verified**. Each layer reports how many
decorated signatures it carries and their four-byte hints, which narrow down
which key *claims* to have signed — nothing more. The tool makes no claim that
a signature is valid or that either account's thresholds are met.

It never signs and never submits, and a pasted secret seed is refused on the
`S` prefix alone, before any decoding, so it is never held in hook state.

Refusing it is not quite enough, though: a textarea keeps showing whatever was
typed into it. So the schema tags that one rejection with a `secret_key`
detail, the hook counts those rejections, and the panel keys the form on that
counter — remounting it, which actually wipes the seed out of the field. The
detail carries the *reason*, never the value. Every other bad paste is left
alone, because clearing a user's input on an ordinary typo would be hostile.

Nothing is transmitted: `msw/handlers.ts` is empty by design.

## Fixtures

Envelopes are built with the SDK from fixed raw seeds — including muxed
sources, an unsigned pair of layers, a fee past `Number.MAX_SAFE_INTEGER`, a v0
envelope and an ordinary v1 envelope — so every fixture is genuinely
well-formed and identical on every machine.
