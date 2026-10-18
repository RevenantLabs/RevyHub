# Sequence Number Inspector

Reads a Stellar account's current sequence number, calculates its next valid
transaction sequence, decodes the ledger-and-offset structure, and validates
an optional bump-sequence target. Every sequence stays a decimal string or a
`BigInt`; it is never routed through JavaScript's lossy `Number` type.

## How it works

The tool validates a public ed25519 account address with the Stellar SDK's
StrKey checksum, then requests `GET /accounts/{account_id}` from the Horizon
instance for the selected network. It reads only `sequence` and
`sequence_ledger` from that response.

Classic account sequences are signed 64-bit integers. The account-creation
ledger is encoded in the high 32 bits and the per-account offset occupies the
low 32 bits:

```text
creation ledger = sequence >> 32
offset          = sequence & 0xffffffff
prefix maximum  = (creation ledger << 32) | 0xffffffff
```

The creation-ledger interpretation is exact for the initial sequence and while
transactions remain inside that 32-bit prefix. A large bump-sequence target can
cross the prefix maximum and replace those high bits; the UI calls this out
because the original creation ledger can no longer be reconstructed from the
sequence alone afterward.

The prefix maximum is not the same thing as Horizon's `sequence_ledger`.
`sequence_ledger` is the ledger in which the account's current sequence value
last changed; both values are shown with distinct labels to avoid conflating
them.

The next normal transaction uses `current + 1`. At the signed int64 ceiling
there is no valid next value, which the result represents explicitly rather
than overflowing. An optional bump target is first checked for decimal/int64
shape and then, after Horizon responds, checked against the live current
sequence. A target equal to or below current is rejected as
`invalid_bump_target`.

Requests use an `AbortSignal`; a new submission or reset aborts the previous
one. State is tagged with the selected network so a result from testnet cannot
remain visible after switching to mainnet.

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

This feature is read-only. It never builds, signs, or submits a transaction or
a bump-sequence operation. It asks only for a public `G...` address. Any value
with the secret-seed `S` prefix is rejected before checksum validation, never
included in hook state or errors, and never sent to Horizon.

## Error model

Expected failures are returned as `Result<T, Code>`, not thrown:

| Code | Recovery |
| --- | --- |
| `empty_input` | Enter a public account address |
| `invalid_address` | Correct the G-address checksum; never enter a secret |
| `invalid_bump_target` | Use a decimal int64 strictly above current |
| `account_not_found` | Check the address and selected network |
| `request_failed` | Retry after checking connectivity or Horizon health |
