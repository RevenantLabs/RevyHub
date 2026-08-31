# Ed25519 Signature Verifier

Verify an Ed25519 signature locally with an explicit message and signature
encoding. The tool reports verified versus not verified and explains that the
result proves possession for one message only.

## How it works

The input is JSON containing a public key, message, signature, and encoding
choices. UTF-8, hex and base64 message bytes are explicit; signatures must
decode to exactly 64 bytes. No request is made.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Input parsing and validation |
| `lib/` | Tool logic and error mapping |
| `hooks/` | React state machine |
| `components/` | Form, result, empty and error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data |
| `msw/` | Request mocks |

## Safety

This is an offline verifier. It rejects secret seeds before checksum handling,
never transmits key material, and cannot sign or submit a transaction.
