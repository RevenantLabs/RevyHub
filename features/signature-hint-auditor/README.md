# Transaction Signature Hint Auditor

Decode a pasted transaction envelope offline and map every decorated signature
hint to optional public-key candidates — without treating a hint match as a
verified signature.

## How it works

The tool reads base64 transaction-envelope XDR with `@stellar/stellar-sdk` in
the browser. It walks every decorated signature in original order and records
the four-byte hint (lowercase hex). When you paste optional `G…` public keys,
each key's hint is derived the same way the network does — the last four bytes
of the raw public key — and compared to the envelope.

A hint can match zero, one or many provided keys. Multiple matches are
collisions: every candidate is listed and none is preferred. Fee-bump envelopes
keep outer and inner signature vectors in separate groups so a fee-source hint
is never confused with an inner signer.

## The non-obvious decision

**A matching hint is labelled a hint match, never a verified signature.** Four
bytes are not a proof. Two unrelated keys can share them, and this tool will
happily show both as candidates. Cryptographic verification, threshold checks
and submission are all out of scope on purpose.

Secret seeds (`S…`) are refused on the prefix alone — in the envelope field and
in the signer list — and the form is remounted so the seed does not sit in the
textarea. Input stays in memory for the session; `msw/handlers.ts` is empty.

## Error outcomes

| Code | Meaning |
| --- | --- |
| `empty_xdr` | Nothing was pasted in the envelope field |
| `invalid_xdr` | Not usable envelope XDR (including refused secret seeds) |
| `invalid_public_signer` | A signer token is not a valid `G…` public key |
| `unsupported_envelope` | Envelope discriminant is not classic v0/v1 or fee-bump |
| `too_many_signers` | More than 64 public keys in one paste |

## Fixtures

Envelopes are built from fixed raw seeds. The collision fixture forces two
genuine public keys to share a recorded hint so the ambiguous-hint UI path is
deterministic without hunting for a real on-chain collision.
