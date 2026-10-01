# Testnet Keypair Generator

Generates safe, cryptographically secure Ed25519 Stellar keypairs client-side for Testnet development, accompanied by security guidance and export utilities.

## How it works

The generator invokes `@stellar/stellar-sdk`'s `Keypair.random()` entirely inside the browser. It derives the public account ID (`G...`) and private secret seed (`S...`).

To verify readiness for testing and development, it optionally queries the public Stellar Testnet Horizon endpoint (`https://horizon-testnet.stellar.org/accounts/<publicKey>`). A `404 Resource Missing` response indicates a fresh, uncreated account ready to be funded by Friendbot.

### Non-obvious design decisions

1. **Secret masking by default**: The generated secret seed is masked (`S••••...`) upon generation. Users must explicitly click to reveal it, protecting against accidental screen captures, video recordings, or shoulder-surfing during streams.
2. **Strict prohibition of secret key inputs**: The form accepts an optional descriptive label. If a user mistakenly attempts to input or paste a private key starting with `S`, the input validator immediately rejects it (`secret_input_prohibited`) before any execution.
3. **Zero secret transmission**: The secret seed is strictly held in local component memory. When verifying ledger status against Horizon or generating the Friendbot link, only the public key (`G...`) is ever transmitted.

## Result codes

| Code | Meaning | Guidance |
| --- | --- | --- |
| `secret_input_prohibited` | An `S...` private seed was entered into the input field | Clear the input field and generate a fresh keypair instead |
| `label_too_long` | The descriptive label exceeds 50 characters | Shorten the label to under 50 characters |
| `horizon_unavailable` | Testnet Horizon endpoint could not be reached (5xx / network error) | Check connection or disable network verification |
| `rate_limited` | Horizon rate limit reached (HTTP 429) | Wait briefly before re-trying |
| `request_failed` | Horizon returned an unhandled transport error | Retry shortly or disable network check |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Tool registry metadata, icon, and tags |
| `panel.tsx` | Entrypoint exporting the panel component |
| `types.ts` | Domain types, network check states, and error codes |
| `schema.ts` | Input parsing, normalization, and secret key prohibition guard |
| `copy.ts` | Localized copy and structured error messages |
| `lib/testnetKeypairGenerator.ts` | Ed25519 keypair generation and Horizon testnet account verification |
| `lib/testnetKeypairGenerator.errors.ts` | Transport and Horizon error mapping |
| `lib/format.ts` | Secret masking, export JSON, and export text formatters |
| `hooks/useTestnetKeypairGenerator.ts` | React lifecycle state machine (idle, loading, success, error) |
| `components/TestnetKeypairGeneratorPanel.tsx` | Main panel composing all 4 UI states |
| `components/TestnetKeypairGeneratorForm.tsx` | Form for optional label and network check toggle |
| `components/TestnetKeypairGeneratorResult.tsx` | Keypair display, reveal toggle, warning banner, and JSON export |
| `components/TestnetKeypairGeneratorEmptyState.tsx` | Pre-interaction empty state |
| `fixtures/testnetKeypairGenerator.fixture.ts` | Deterministic keypair fixtures derived from fixed seed |
| `msw/handlers.ts` | MSW request mocks for testnet Horizon responses |
| `__tests__/` | Logic, schema, format, hook, panel, and a11y test suites |
| `e2e/testnet-keypair-generator.spec.ts` | Declarative end-to-end user journey specification |

## Safety

This tool operates strictly for the Stellar Testnet. Real funds must never be deposited to testnet accounts. Private keys are generated locally in-memory and are never transmitted to any backend server.
