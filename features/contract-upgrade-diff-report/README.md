# Contract Upgrade Compatibility Diff Report

Compares two Soroban contract Wasm files — the one deployed today and the one
you intend to upgrade to — and reports how their **declared** interface and
metadata changed: functions, argument and return types, user-defined types,
error enums, the environment interface version and publisher metadata. Both
binaries are parsed in the browser and are never compiled, instantiated or
executed.

> This is a declared-interface report, not proof of behavioral or storage
> compatibility.

## How it works

1. **Bounds first.** Each file must be non-empty and at most 1 MiB
   (1,048,576 bytes, inclusive). `File.size` is checked before any read, and
   the real byte count is checked again after it (`schema.ts`).
2. **Framing.** `lib/wasm-interface-extract.ts` walks the section headers
   only. Every unsigned LEB128 `u32` is bounded to five bytes with the top
   bits of the fifth checked, and every declared length is compared with the
   bytes that remain before it is used. Custom-section names must be valid
   UTF-8 and standard sections may not repeat.
3. **Decoding.** The three Soroban custom sections are decoded as XDR streams
   with the installed SDK's own definitions (`xdr.ScSpecEntry`,
   `xdr.ScEnvMetaEntry`, `xdr.ScMetaEntry` read through `cereal.XdrReader`).
4. **Code hash.** SHA-256 of the full upload, which is the Soroban Wasm hash.
5. **Diff.** `lib/interface-compatibility-diff.ts` compares declarations by
   stable name and classifies each as added, removed, changed, unchanged or
   unknown. `lib/contractUpgradeDiffReport.ts` composes the result.

No request is made. `msw/handlers.ts` is empty on purpose, and the hook test
asserts `fetch` is never called.

## Supported variants

| Input | Handling |
| --- | --- |
| Core Wasm binary version 1, section ids 0–13 | Read |
| Component-model / other binary versions, unknown section ids | `unsupported_variant` |
| `contractspecv0` entries: function, struct, union, enum, error enum (V0) | Compared |
| Spec entry kinds the installed SDK does not define (e.g. later event specs) | Section marked `unsupported_variant`; declarations unknown |
| `contractenvmetav0` interface version `{ protocol, preRelease }` | Compared (also byte-compatible with the older `u64` encoding) |
| `contractmetav0` `ScMetaV0` key/value entries | Compared by key |

## The non-obvious decisions

**Missing evidence is never a result.** A section problem inside a well-framed
module does not fail the report; it becomes an evidence gap. When either
specification is absent, malformed or unsupported, every declaration known
from the other side is listed as `unknown` — never `added` or `removed`. A
function missing from an unreadable spec has not been removed. The verdict
banner is also withheld: "only additions" or "interface unchanged" is only
ever said with complete evidence.

**Absent is not empty.** An absent `contractspecv0` is missing evidence; a
present section with zero entries is a valid, empty interface, and two of them
compare as an empty diff.

**Duplicates and collisions.** Repeated custom sections are decoded and
merged. Byte-identical repeats collapse silently (and are listed as
duplicates); two different declarations sharing one stable name — two
`transfer` functions, or a struct and an error enum both called `Error` (they
share Soroban's user-defined type namespace) — are a *collision*, and that
name is reported as `unknown` while every other name is still compared. A
member repeated inside one declaration (an error enum with `NotFound` twice)
is treated the same way. Two environment sections that disagree are
`conflicting` and neither version is trusted.

**Identity of parts.** Function arguments are positional on the wire, so they
are compared as `argument 1`, `argument 2`, … with name and type. Struct
fields and union, enum and error cases are encoded by name, so they are
compared by name and a pure reordering is not a change. Doc strings are
excluded.

**Conservative impact.** Removed or changed → may break callers; added →
additive; unknown → not assessed.

**Malformed vs unsupported.** The SDK reports an unknown enum discriminant as
`unknown <Enum> member for value N`, which is what a newer protocol's entry
kind looks like, so that is `unsupported_variant`. Truncation, bad padding,
invalid UTF-8, over-deep type nesting (more than 32 levels) and exhausted
recursion are `malformed_data`.

## Error codes

| Code | Meaning |
| --- | --- |
| `invalid_input` | A file is missing or empty, or holds only a secret seed |
| `too_large` | A file exceeds 1 MiB |
| `malformed_data` | The Wasm header, a LEB128 length or a section boundary is invalid |
| `unsupported_variant` | Not a core Wasm v1 module, or an unknown section id |
| `read_failed` | The browser could not read the file |

Every error names the side (old or new) it belongs to.

## Known limits

- Only declared interfaces are compared: behavior, storage layout,
  authorization and event emission are not analysed.
- Contract specs are only as truthful as the toolchain that wrote them.
- Unknown spec entry kinds make the whole spec section unknown: the XDR stream
  cannot be resynchronised past an entry whose length is not known.

## Safety

This tool never asks for, accepts or displays a secret key. A file containing
only a secret seed is refused on shape alone, and a file name shaped like one
is replaced with a neutral label. Every uploaded string (names, metadata
values) is rendered as inert text. Nothing is uploaded, stored or logged.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata (`networks: []`, `offline: true`) |
| `schema.ts` | Presence, 1 MiB bound and secret-seed checks before decoding |
| `lib/wasm-interface-extract.ts` | Bounded section reader and SDK XDR decoding |
| `lib/interface-compatibility-diff.ts` | Conservative declaration, environment and metadata diff |
| `lib/contractUpgradeDiffReport.ts` | Composes both sides into the report |
| `lib/contractUpgradeDiffReport.errors.ts` | File-read and decode-failure mapping |
| `lib/format.ts` | Exact byte, hash and version formatting |
| `hooks/` | idle / loading / success / error, with obsolete-read protection |
| `components/` | Form, result, change rows, coverage and empty state |
| `fixtures/` | Wasm modules built from SDK XDR encoders |
| `__tests__/` | Domain, boundary, hook, component and accessibility tests |
