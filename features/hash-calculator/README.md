# Stellar Hash Calculator

Computes cryptographic SHA-256 digests over arbitrary data (UTF-8, hexadecimal, and base64) and derives deterministic Stellar transaction hashes from transaction envelopes (XDR). The feature executes completely client-side in the browser, declaring `networks: []` and `offline: true` in `manifest.ts`.

## How It Works

### 1. Raw Data Mode (SHA-256)
Computes standard 256-bit cryptographic digests over input payloads:
- **UTF-8**: Encoded to byte sequence using `TextEncoder`.
- **Hexadecimal**: Validated and decoded byte-by-byte.
- **Base64**: Validated and decoded using standard base64 decoding.

Digest computation uses the browser's native Web Crypto API (`crypto.subtle.digest("SHA-256")`), returning both 64-character lowercase hexadecimal strings and standard base64 strings with one-click clipboard copying.

### 2. Transaction Envelope Mode (XDR)
Computes canonical Stellar transaction identifiers from base64-encoded transaction envelopes.

Stellar transaction hashes are not simple SHA-256 hashes of the raw XDR payload. Instead, Stellar hashes the transaction signature preimage:
```
TransactionHash = SHA-256(networkPassphrase + ENVELOPE_TYPE_TX + transactionBody)
```

Because the network passphrase is an explicit component of the preimage:
- The exact same transaction envelope produces distinct transaction hashes on Testnet versus Public/Mainnet.
- This cryptographic separation prevents cross-network replay attacks, ensuring a transaction signed for Testnet cannot be executed on Mainnet.

The feature computes the active hash for the selected passphrase and calculates the comparison hashes across Testnet and Public simultaneously, providing one-click switching buttons to demonstrate the impact of the network passphrase on the resulting hash.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Slice metadata, offline configuration, and navigation entry |
| `types.ts` | Input, output, preset, and error code type definitions |
| `copy.ts` | User-facing copy, labels, hints, and actionable error descriptions |
| `schema.ts` | Form input parsing, encoding validation, and secret key rejection |
| `lib/hashCalculator.ts` | Web Crypto hashing and Stellar SDK transaction envelope hashing |
| `lib/hashCalculator.errors.ts` | Deterministic error classifier |
| `lib/format.ts` | Byte length and encoding formatters |
| `hooks/useHashCalculator.ts` | React state machine managing calculation states and network switching |
| `components/HashCalculatorForm.tsx` | Mode selection, encoding controls, and envelope inputs |
| `components/HashCalculatorResult.tsx` | Hex/base64 output cards and network passphrase comparison |
| `components/HashCalculatorPanel.tsx` | Panel orchestrator coordinating form, loading, results, and errors |
| `components/HashCalculatorEmptyState.tsx` | Accessible empty state display |
| `fixtures/hashCalculator.fixture.ts` | Deterministic keypair derivation and precomputed test vectors |
| `msw/handlers.ts` | Empty MSW handler set confirming offline operation |
| `e2e/hash-calculator.spec.ts` | Declarative end-to-end user journey specification |

## Safety Invariants

1. **Client-Side Only**: All calculations run locally in the client browser. No data is sent over the network or saved to local storage.
2. **Rejection of Secret Keys**: Any input beginning with the secret seed prefix (`S`) is rejected before processing. Secret keys are cleared from form state immediately upon submission and are never rendered into DOM elements or error banners.
3. **No Cryptographic Mocking**: Production hashing logic uses authentic Web Crypto SHA-256 and official `@stellar/stellar-sdk` preimage computation.
