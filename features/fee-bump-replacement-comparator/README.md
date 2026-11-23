# Fee-Bump Replacement Comparator

Compares two fee-bump envelopes that are supposed to wrap the same inner
transaction and reports whether only the outer fee terms differ.

## How it works

Each side is decoded as a fee-bump envelope under an explicit network
passphrase. For every side the tool records:

- outer maximum fee (stroops), fee-source account and outer signature count
- inner transaction hash under the selected passphrase
- inner source, sequence, operation count and inner signature count
- a signature-free canonical payload of the inner transaction body

Those two views are then compared. Outer fee arithmetic is exact `BigInt`
subtraction so a 64-bit fee never rounds through floating point.

## The non-obvious decision

**An equivalent-inner verdict requires both the network-aware hashes and the
signature-free payloads to match.** Matching payloads alone are incomplete
evidence under a different network context — the same body hashes differently
on testnet and mainnet. Matching hashes alone would hide a decoder bug that
disagreed with the wire bytes. Either mismatch refuses the verdict and the UI
shows an incomplete-evidence warning rather than calling the pair a
replacement candidate.

Inner signatures are counted but deliberately left out of the payload: two
wrappers around the same body with different inner signatures still count as
equivalent when the hashes agree. Changed inner source or sequence fails both
checks and is refused.

## Why the passphrase is its own input

A transaction hash is derived from the network passphrase. An envelope does
not carry its passphrase, so the hash cannot be computed without asking.
Rather than guessing a default, the passphrase is required, the standard
networks are offered with a custom escape hatch, and the passphrase actually
used is echoed in the result.

## What this tool will not do

It never signs, never submits, and never predicts mempool acceptance of a
lower or higher replacement fee. A pasted secret seed is refused on the `S`
prefix alone and cleared from the form. Nothing is transmitted:
`msw/handlers.ts` is empty by design.

## Fixtures

`fixtures/normal.fixture.ts` builds a higher-fee replacement of the same
inner, a differently signed inner, and a large fee past
`Number.MAX_SAFE_INTEGER`. `fixtures/boundary.fixture.ts` covers a lower
outer fee, changed inner source/sequence, ordinary v0/v1 envelopes, malformed
bytes and a secret seed.
