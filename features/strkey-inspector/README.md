# StrKey Type Inspector

Inspects Stellar StrKey encodings entirely in the browser, decodes their binary payloads into hexadecimal representation, and extracts multiplexed account components without exposing private seeds.

## How it works

`inspectStrkey` parses the leading character to identify the Stellar StrKey version byte (SEP-0023). It separates prefix identification from checksum validation:
1. Input is trimmed of whitespace.
2. Secret seeds (values starting with `S` or `s`) are rejected immediately on prefix alone without decoding, checksumming, state persistence, or DOM rendering.
3. Supported public prefixes (`G`, `M`, `C`, `T`, `X`, `P`) are decoded using `@stellar/stellar-sdk`'s native StrKey decoders.
4. For multiplexed accounts (`M`), the 40-byte binary payload is parsed into its 32-byte Ed25519 public key (encoded back to a `G...` address) and 8-byte big-endian 64-bit integer multiplexing ID.
5. Checksum and length failures are reported as `bad_checksum`.
6. Unrecognised prefixes are reported as `unknown_prefix`.

## Result Codes

| Code | Meaning | User Guidance |
| --- | --- | --- |
| `empty_input` | Nothing was submitted | Prompt to enter a StrKey |
| `secret_seed_rejected` | Private seed (`S...`) detected | Discarded immediately; warn user never to share private seeds |
| `unknown_prefix` | First character is not a recognized version byte | Prompt user to check for typos or unsupported prefixes |
| `bad_checksum` | Valid prefix, failed base32 decoding or checksum | Prompt user to check for missing or mistyped characters |
| `request_failed` | Unexpected execution error | Fallback error guidance |

## Supported StrKey Kinds

| Kind | Prefix | Payload Length | Description |
| --- | --- | --- | --- |
| `ed25519_public_key` | `G` | 32 bytes | Standard Ed25519 account public key |
| `muxed_account` | `M` | 40 bytes | Multiplexed account (32-byte pubkey + 8-byte ID) |
| `contract` | `C` | 32 bytes | Soroban smart contract identifier |
| `pre_auth_tx` | `T` | 32 bytes | Pre-authorized transaction hash |
| `sha256_hash` | `X` | 32 bytes | SHA-256 hash signer (HashX) |
| `signed_payload` | `P` | Variable (>= 36 bytes) | Signed payload signer |

## Safety

This tool operates completely client-side and issues zero network requests. It never stores, displays, or transmits private seeds.
