# Memo Encoder and Decoder

Builds any of the five Stellar memo types, shows the exact bytes a transaction
would carry, and reads those bytes back. Everything runs in the browser: the
manifest declares `networks: []` and `offline: true`, and `msw/handlers.ts`
exports an empty array because there is nothing to mock.

Memos are how exchanges route deposits into the right account. The wrong type,
or a text memo one emoji too long, is a common way to lose one.

## What it encodes

The XDR definition this slice implements:

```
union Memo switch (MemoType type) {
case MEMO_NONE:   void;
case MEMO_TEXT:   string text<28>;
case MEMO_ID:     uint64 id;
case MEMO_HASH:   Hash hash;      // 32 bytes
case MEMO_RETURN: Hash retHash;   // 32 bytes
};
```

Every encoding is a four-byte big-endian discriminant followed by the body for
that type. `MEMO_TEXT` is the only variable-length case, so it is the only one
with a length prefix and XDR padding.

## The non-obvious decision: the codec is hand-written

The SDK can encode a memo in one line. This slice does it by hand anyway,
because the point of the tool is to show *where each byte comes from* — the
discriminant, the length prefix, the value and the zero padding are separate
labelled runs in the UI, and an SDK call returns only the finished blob.

That trade is only safe if the hand-written path is checked against the real
one, so `__tests__/memoInspector.test.ts` encodes every variant with both this
codec and the SDK's `Memo` and asserts the two agree byte for byte. If a
protocol change ever moves the encoding, that test fails rather than the tool
quietly producing bytes nobody can spend.

The codec also works on `Uint8Array` and the platform's `btoa`/`atob` instead of
Node's `Buffer`, so nothing in the shipped path depends on a polyfill.

## Byte limits, not character limits

A text memo holds **28 bytes**. That is a byte budget:

| Value | Characters | Bytes |
| --- | --- | --- |
| `"a".repeat(28)` | 28 | 28 — fits |
| `"🚀".repeat(7)` | 7 | 28 — fits |
| `"🚀".repeat(10)` | 10 | 40 — rejected |

The counter under the field is live and measures the same thing the validator
does, including the trim: a text memo keeps its inner spaces, because they are
part of the payload, but the outer whitespace of a paste is dropped, because a
trailing newline is never something a user meant to spend four of their 28
bytes on.

When the value is over budget the counter says by how much — "40 / 28 bytes —
12 over" — because knowing you are over is useless when every character you
delete is worth four bytes.

## Ids and hashes

- **Ids** are unsigned 64-bit integers, parsed and carried as `BigInt` from end
  to end. `18446744073709551615` is accepted and `18446744073709551616` is not,
  and no value ever passes through a float.
- **Hashes** are exactly 32 bytes and may be written as hex or as base64
  (standard or URL-safe, padded or not). Hex is tried first on purpose: 64 hex
  characters are also syntactically valid base64, but they decode to 48
  unrelated bytes, so reading them as base64 would silently reject a correct
  hash.

## The decoder

Everything encoded is immediately decoded again and shown as "Decoded back". A
round trip that does not match the input means the encoding is wrong, and the
same `decodeMemo` handles the failures a hand-assembled blob can produce:
unknown discriminant, truncated body, padding that does not add up, and text
bytes that are not valid UTF-8.

## Safety

A memo is public and unencrypted; it travels with the transaction and anyone
can read it, which the result panel says out loud.

No secret key can get through: a seed is 56 bytes and a text memo holds 28, and
as a hash it decodes to 42 bytes rather than 32. `__tests__/schema.test.ts`
asserts the rejection for every memo type and
`__tests__/MemoInspectorPanel.test.tsx` asserts the value is never echoed back
into the page.
