# Manage-Data Payload Encoding Workbench

Builds a manage-data entry byte by byte and shows the exact operation XDR it
produces.

## The non-obvious decision

**Both limits are enforced in bytes, up front, because the SDK's own guard
counts characters.**

`Operation.manageData` validates the name with what amounts to
`String.length` — its error even says *"name must be a string, up to 64
characters"*. A name of 64 two-byte characters is 128 bytes, sails past that
check, and then dies deep inside the XDR writer with:

```
XDR Write Error: got 64 bytes, max allowed is 64
```

Which reads like a contradiction, because the two numbers are counting
different things.

So `schema.ts` measures with `TextEncoder` before the SDK is ever called, and a
name like that comes back as `name_too_long` with a byte count the user can act
on. The value is measured the same way — **after** decoding, since 128 hex
characters are 64 bytes and would look twice over the limit if the typed text
were measured instead.

There is a fixture for each side of this: 32 two-byte characters (32
characters, exactly 64 bytes — legal) and 64 two-byte characters (64
characters, 128 bytes — refused).

## Deleting is not setting an empty value

These are different operations and the tool never blurs them.

A delete encodes the value optional as **absent**. A set with no bytes encodes
it as **present and zero-length**. The difference is visible in the XDR itself,
not just in the labels — there is a test that decodes both and asserts the raw
`dataValue()` optional differs, and another asserting the two base64 strings
are not equal.

It matters on the ledger too: a delete removes the entry and releases its base
reserve, while a zero-byte set keeps the entry alive holding nothing. The UI
says which one you just built, both times.

In delete mode the value inputs are **hidden rather than disabled**. A greyed
out field still suggests the text in it is part of the operation, and it is
not — it is not even read.

## The preview is decoded, not echoed

The "Decoded back from the XDR" panel is read out of the generated operation
with `xdr.Operation.fromXDR`, not copied from the form. The tool's whole claim
is *"these are the bytes you will get"*, so if the SDK ever encoded something
other than what was asked for, this panel would show it rather than hide it.

## Rendering bytes safely

Text is shown only when decoding is **lossless**: strict `TextDecoder` plus a
re-encode compared byte for byte. `TextDecoder` without `fatal` silently
substitutes U+FFFD, which would display characters that are not in the data, so
anything that fails the round trip is shown as hex only, with a notice saying
why.

Control characters survive a lossless decode but must not be rendered as
themselves — a raw NUL, backspace or escape can move the cursor, blank the line
or hide what follows, misrepresenting the very bytes the user came to inspect.
They are escaped to `\uXXXX` instead, and the hex stays authoritative.

The control range is tested by code point rather than with a regex literal: a
regex containing raw control characters is invisible in a diff and easily lost
to a formatter. The tests build them with `String.fromCharCode` for the same
reason.

## No transaction, and no secret keys

The output is a **standalone, unsigned operation**. There is no source account,
sequence number, fee or signature, and nothing that could be submitted by
accident. A test asserts the result decodes as an `Operation` and *fails* to
decode as a `TransactionEnvelope`.

A secret seed is refused in either field on the `S` prefix alone, and then
cleared out of the form — the schema tags that one rejection with a
`secret_key` detail (the reason, never the value), the hook counts it, and the
panel keys the form on that counter so the remount wipes the field. Of
everywhere in this app, this is where it matters most: the output of this tool
is designed to go on-chain, where a data entry is public and permanent.
