# Transaction Signing Payload Inspector

Paste a classic v0, classic v1, or fee-bump transaction envelope and choose testnet or mainnet. The result shows the SHA-256 network ID, the exact serialized signature payload in hex, its byte length, and the SHA-256 hash a signer signs.

## Data and design

Everything runs locally with the installed Stellar SDK. The form accepts only envelope XDR and a fixed network choice; it never requests or displays a secret key, signs, submits, stores, or sends the envelope. The raw paste is capped at 65,536 characters before XDR decoding. Invalid base64, malformed XDR, and unsupported envelope tags have separate error codes where decoding permits.

The signature base is Stellar's `TransactionSignaturePayload`: 32 network-ID bytes, a 4-byte envelope tag, and the transaction XDR. Classic v0 uses `ENVELOPE_TYPE_TX` (2) and a converted `Transaction` XDR for backwards compatibility. A fee bump signs `ENVELOPE_TYPE_TX_FEE_BUMP` (5) over the outer fee-bump transaction, while inner signers sign a separate `ENVELOPE_TYPE_TX` payload over its inner transaction. Existing decorated signatures are excluded from both signing payloads. Changing the network clears the previous result so hashes cannot be mistaken for the new choice.

## Verification

The deterministic fixtures derive addresses from fixed seed bytes and build envelopes with the SDK. The fee-bump fixture includes a synthetic decorated signature so tests can prove it changes the outer payload while leaving the inner payload unchanged; no signing occurs. Unit tests compare signature base bytes and hashes with SDK `signatureBase()` and `hash()` output. Component and accessibility tests cover the visible states. The MSW handler list is empty because there is no request boundary.
