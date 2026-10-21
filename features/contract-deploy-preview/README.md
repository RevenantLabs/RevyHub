# Contract Deploy Preview

Paste a transaction envelope that contains a `CreateContract` or
`CreateContractV2` host function invocation, and this tool decodes — entirely
in your browser — the contract ID preimage source, the executable it deploys
from, and any constructor arguments it would pass.

## How it works

**Data source:** the pasted transaction envelope XDR, decoded locally with
the Stellar SDK. This tool is fully offline (`networks: []`,
`offline: true` in `manifest.ts`) and makes no Horizon or RPC request.

1. `schema.ts` validates the pasted text is well-formed base64 before it
   reaches the decoder.
2. `lib/create-contract-decode.ts` decodes the envelope (classic v0/v1, or a
   fee-bump's inner transaction) and scans its operations for the first
   `invokeHostFunction` operation whose host function creates a contract.
   If none exists, the error carries the operation type names that *were*
   found, so the UI can say what the envelope actually contains.
3. `lib/preimage-source.ts` reads the `ContractIdPreimage` — either an
   address plus a salt, or a classic `Asset` — and the `ContractExecutable`
   — a Wasm hash or the built-in Stellar Asset Contract.
4. `lib/constructor-args.ts` decodes `CreateContractV2`'s constructor
   arguments (empty for the older `CreateContract` shape) using
   `scValToNative` so every `ScVal` type displays without a bespoke case for
   each one.

## The non-obvious decision

Computing the final deployed contract address requires the network
passphrase and the exact preimage-hashing rule (`sha256` over a
`HashIDPreimage::CONTRACT_ID` structure that embeds the preimage and, for
address-derived contracts, the invoking account). Those details belong to
the Stellar SDK's own address-derivation code, not to the envelope itself,
so recomputing it here would be guessing at inputs the caller never gave us.

This tool shows the **inputs** to that computation plainly — the preimage
kind, the address and salt (or the asset), and the executable — rather than
presenting an unverified guess as a final deployed address. A reviewer who
needs the actual address should compute it with the same SDK, on the
network the transaction targets.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata (offline, no supported networks) |
| `schema.ts` | Input parsing and validation |
| `lib/create-contract-decode.ts` | Decodes the contract-creation host function |
| `lib/preimage-source.ts` | Identifies the salt- or asset-derived preimage source and executable |
| `lib/constructor-args.ts` | Decodes constructor arguments when present |
| `lib/contractDeployPreview.ts` | Orchestrates the above into one `Result` |
| `lib/format.ts`, `lib/format-operations.ts` | Presentation formatting |
| `hooks/` | React state machine (synchronous — no loading state) |
| `components/` | Form, result, preimage/constructor-arg rows, and empty/error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample envelopes, including the Wasm-preimage and asset-preimage edge cases |
| `msw/` | Empty — this tool makes no request |
| `e2e/` | Declarative end-to-end specifications |

## Safety

This tool never accepts, displays, stores or transmits a secret key, and
never signs or submits anything — it only decodes what was pasted.
