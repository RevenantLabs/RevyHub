# Muxed Account Encoder and Decoder

Converts between Stellar multiplexed addresses (SEP-0023 M-addresses) and their
underlying base account addresses (G-addresses) plus 64-bit multiplexing IDs.
Performs all encoding and decoding locally in the browser with zero network requests.

## How it works

SEP-0023 defines a multiplexed address format using the `med25519` StrKey version
byte (prefix `M`). The binary payload consists of:
1. 32 bytes: Ed25519 public key (the underlying G-address).
2. 8 bytes: Unsigned 64-bit big-endian integer ID.

Decoding extracts the first 32 bytes and encodes them as an Ed25519 public key
(`G...`), and reads the final 8 bytes as an unsigned 64-bit big-endian integer.
Encoding reverses this process by decoding the base G-address, serializing the
64-bit integer to an 8-byte big-endian buffer, and encoding the combined 40-byte
payload as an `M...` address.

## The Non-Obvious Decisions

### 1. BigInt for Full 64-Bit Range Representation
JavaScript's native `Number` type uses IEEE 754 double-precision floats, which
can only safely represent integers up to `Number.MAX_SAFE_INTEGER` (`2^53 - 1 = 9,007,199,254,740,991`).
SEP-0023 multiplexing IDs use the full unsigned 64-bit integer range (`0` to `18,446,744,073,709,551,615`).
Exchanges and custodians routinely generate multiplexing IDs exceeding `2^53`.
Parsing IDs with `parseInt` or `Number` causes silent truncation and produces corrupted
addresses. This slice processes IDs strictly as strings and `BigInt`, reading and writing
via `readBigUInt64BE` and `writeBigUInt64BE` without precision loss.

### 2. Ledger Account vs. Routing Disambiguation
An M-address and its base G-address represent the same on-chain account. The Stellar
ledger only records balances, trustlines, and signers under the base G-address.
The multiplexing ID is an application-layer routing mechanism that eliminates
the need for transaction memos. The UI prominently explains this relationship
so developers and users do not attempt to fund an M-address as a distinct keypair.

### 3. Immediate Secret Key Rejection
Any input beginning with `S` is rejected immediately on prefix detection.
The submitted string is never echoed into hook state, DOM elements, or error descriptions.

## Result Codes

| Code | Meaning |
| --- | --- |
| `empty_input` | Nothing was submitted |
| `invalid_muxed_address` | Not a valid M... address (bad prefix, length, base32, or checksum) |
| `invalid_base_address` | The base G-address fails the StrKey Ed25519 checksum |
| `invalid_id` | The multiplexing ID is not an unsigned 64-bit integer (`0` to `18446744073709551615`) |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Feature registry metadata (`offline: true`, `networks: []`) |
| `types.ts` | Input, output, mode, and error code definitions |
| `schema.ts` | Non-throwing form and raw input validation |
| `copy.ts` | User-facing copy, error titles/descriptions, and architectural explanations |
| `lib/muxedAccountCodec.ts` | SEP-0023 encoding and decoding with BigInt uint64 buffers |
| `lib/muxedAccountCodec.errors.ts` | Error code mapping and redaction predicates |
| `lib/format.ts` | Thousand-grouped decimal and padded hex formatters for 64-bit IDs |
| `hooks/useMuxedAccountCodec.ts` | Four-state management hook (`idle`, `loading`, `success`, `error`) |
| `components/` | Form, result, empty state, and panel components |
| `msw/handlers.ts` | Empty request handler array for offline execution |
| `fixtures/` | Deterministic keypairs derived from fixed seeds |
| `__tests__/` | Comprehensive unit, hook, component, formatting, schema, and a11y tests |
| `e2e/` | Declarative end-to-end user journey specification |

## Safety

This tool is entirely client-side and offline. It never transmits data over the network,
stores credentials, or accepts secret seeds.
