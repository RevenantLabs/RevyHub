# Soroban Authorization Entry Inspector

Decodes the authorization entries attached to a Soroban invocation and renders
the authorisation tree: who must sign, for which sub-invocation, under which
nonce and expiry.

## How it works

The tool is fully offline. It parses a pasted base64 transaction envelope,
locates the `InvokeHostFunction` operation, and extracts each
`SorobanAuthorizationEntry`. Each entry is rendered as a recursive tree:

- **Credentials**: either source-account authorization or address credentials
  with account/contract ID, nonce, and signature expiration ledger.
- **Invocation tree**: the contract, function, and arguments for the root call
  and every nested sub-invocation bundled under the same signature.

Sub-invocations are flagged because they are the calls a signer most needs to
notice before signing.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata (`offline: true`, `networks: []`) |
| `schema.ts` | Validates base64 input shape |
| `lib/sorobanAuthInspector.ts` | Envelope → auth tree parsing |
| `lib/sorobanAuthInspector.errors.ts` | Error-code mapping placeholder |
| `lib/format.ts` | Tree statistics helpers |
| `hooks/useSorobanAuthInspector.ts` | React state machine |
| `components/SorobanAuthInspectorPanel.tsx` | Composes idle, loading, success, error |
| `components/SorobanAuthInspectorForm.tsx` | XDR textarea input |
| `components/SorobanAuthInspectorResult.tsx` | Tree rendering |
| `components/SorobanAuthInspectorEmptyState.tsx` | Pre-interaction state |
| `fixtures/sorobanAuthInspector.fixture.ts` | Deterministic envelopes with/without auth |
| `msw/handlers.ts` | Empty — the tool makes no requests |
| `__tests__/` | Logic, schema, formatting, hook, component and a11y tests |
| `e2e/soroban-auth-inspector.spec.ts` | Executable behaviour spec |

## Safety

This tool never asks for, displays, stores or transmits a secret key. It only
inspects public authorization data from a pasted transaction envelope and never
offers to sign or submit.
