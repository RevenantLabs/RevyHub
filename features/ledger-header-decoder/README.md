# Ledger Header XDR Decoder

Paste one base64 `LedgerHeader` XDR blob to read its protocol version, ledger sequence, base fee, base reserve, and embedded SCP value. Decoding uses the Stellar SDK in the browser. This tool makes no requests, never asks for a secret key, and does not check a header against network history.

## Data boundary and failure handling

The input parser bounds raw text at 65,536 characters, removes whitespace, and verifies standard base64 before SDK parsing. The decoder then requires a complete, canonical `LedgerHeader` byte sequence; malformed or trailing data yields `malformed_header` without a partial result. The SCP value is part of the header, so its close time and transaction-set hash are reported separately as well as the close time in the overview.

`StellarValue.upgrades` contains opaque byte vectors, not a fixed array of one known type. The decoder recognizes protocol version, base fee, base reserve, maximum transaction set size and flags as numeric proposals. It checks the complete XDR encoding of each recognized variant. A future variant or a complex config variant is shown as raw hex bytes with its discriminant; the tool does not claim to interpret it. The upgrade list records proposals carried by the SCP value, not proof that a network applied them.

## Implementation

`schema.ts` validates the paste; `lib/ledger-header-decode.ts` parses a complete header; `lib/scp-value-fields.ts` and `lib/upgrades-list.ts` decode the nested fields; `lib/ledgerHeaderDecoder.ts` returns a `Result`. The hook exposes idle, local loading, success and error states. The deterministic fixtures construct real SDK XDR objects, including a multi-upgrade header and an unknown discriminant. MSW handlers are empty because the feature is offline.
