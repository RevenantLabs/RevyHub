# Address Validator

Validates a Stellar address entirely in the browser and explains *why* a value
was rejected, using stable result codes instead of English string matching.

## How it works

`validateAddress` reads the StrKey prefix first (SEP-0023 version bytes), then
runs the matching `StrKey.isValid*` checksum check. Separating those two steps
is what lets the UI distinguish "this is not a Stellar address at all" from
"this is a Stellar address with one mistyped character" — two problems with
very different fixes.

A value starting with `S` is a secret seed. It is rejected on the prefix alone:
no checksum check, no storage in state, and never rendered back to the screen.
Two tests assert the seed does not appear in component output or hook state.

## Result codes

| Code | Meaning |
| --- | --- |
| `valid` | A well-formed Ed25519 account address |
| `empty_input` | Nothing was submitted |
| `secret_seed_rejected` | An `S…` secret seed was submitted and discarded |
| `unknown_prefix` | The first character is not a Stellar version byte |
| `bad_checksum_or_length` | Right prefix, failed base32 checksum |
| `unsupported_kind` | A valid `M…`, `C…`, `T…` or `X…` value, not an account |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Whitespace stripping and empty-input rejection |
| `lib/addressValidator.ts` | Prefix detection and checksum validation |
| `lib/addressValidator.errors.ts` | Blocking and redaction predicates |
| `lib/format.ts` | Kind and length labels |
| `hooks/useAddressValidator.ts` | Synchronous state machine |
| `components/` | Form, result, empty state and panel |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic keypairs from fixed seeds |

## Safety

This tool never asks for, transmits, stores or displays a secret key, and makes
no network requests of any kind.
