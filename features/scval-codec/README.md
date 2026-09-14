# ScVal Encoder and Decoder

This feature slice converts Soroban `ScVal` values between base64 XDR and a readable, round-trippable JSON representation.

## JSON format

Scalar values map naturally:

- `void` → `null`
- `bool` → `boolean`
- `u32` / `i32` → `number`
- `string` → plain JSON string
- `vec` → JSON array

Tagged objects disambiguate types that cannot survive as plain JSON values:

- `u64`, `i64`, `u128`, `i128`, `u256`, `i256` → `{ "_type": "u64", "value": "..." }`
- `timepoint`, `duration` → tagged decimal string
- `bytes` → base64 string inside `{ "_type": "bytes", "value": "..." }`
- `symbol` → `{ "_type": "symbol", "value": "..." }`
- `address` → `{ "_type": "address", "value": "G..." | "C..." }`
- `map` → `{ "_type": "map", "value": [[key, val], ...] }`
- `error` → `{ "_type": "error", "value": { type, code } | { contract } }`

Large integers are kept as decimal strings at the JSON boundary; all arithmetic uses `BigInt` so precision is never lost.

## Decisions

- The tool is fully offline and makes no network requests.
- Maps are encoded as arrays of `[key, value]` pairs because JSON object keys must be strings, while Soroban map keys can be any ScVal.
- The codec handles the full ScVal type set requested by the issue; contract-instance and ledger-key-nonce variants are reported as `unsupported_type` because they are not useful as user-facing values.
