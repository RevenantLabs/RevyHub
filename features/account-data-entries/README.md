# Account Data Entry Viewer

Loads the key/value data entries attached to a Stellar account and makes
Horizon's base64 values readable. Each row keeps the raw value beside its
decoded text or bytes, with copy controls for both representations.

## How it works

The tool loads `GET /accounts/{account_id}` from Horizon and reads the response's
`data` object. Keys are sorted for a stable result, while each value is decoded
independently so one malformed row cannot hide the others.

The non-obvious decision is how to classify text. Base64 must match its strict,
canonical form first. Decoded bytes are called text only if a fatal UTF-8 decode
succeeds, encoding that text produces the exact original bytes, and the result
contains no C0, DEL or C1 control characters. Everything else is shown as hex
with its byte length. Invalid base64 remains a named row-level result.

Network results are tagged with the network that produced them. Switching
between testnet and mainnet derives the old result back to idle, and a request
counter prevents an older response from replacing a newer one.

## Error codes

| Code | Cause |
| --- | --- |
| `empty_input` / `invalid_address` | Rejected locally before any request |
| `account_not_found` | Horizon returned 404 on the selected network |
| `rate_limited` | Horizon returned 429 |
| `request_failed` | A server, transport or timeout failure |

## Safety

Account data is public ledger state. The tool is read-only, rejects secret-key
input on its prefix, never stores or echoes it, and never submits a transaction.
