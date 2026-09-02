# Soroban Simulation Result Explainer

Simulates a pasted Soroban transaction envelope against the selected network's
RPC node and explains the result: fees, resource usage, required
authorizations, return value, events, or why the transaction would fail.

## How it works

The tool makes a single Soroban RPC call:

1. `simulateTransaction` with the provided transaction envelope. The RPC node
   returns either a success result (with `transactionData`, `results`, `events`,
   `cost`, etc.), a failure result (with `error`), or a restore preamble
   indicating archived ledger entries must be restored first.

The response is parsed into a small set of human-readable fields:

- **Fees**: the minimum resource fee and the base network fee.
- **Resources**: CPU instructions, read/write bytes, and ledger entry footprint.
- **Authorizations**: `SorobanAuthorizationEntry` items, showing the signing
  account or contract and nonce when available.
- **Return value and events**: base64 XDR snippets that can be copied for
  further inspection.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Validates a raw transaction envelope XDR string |
| `lib/simulationExplainer.ts` | Calls RPC and parses success/failure/restore |
| `lib/simulationExplainer.errors.ts` | Transport failures → slice error codes |
| `lib/format.ts` | Stroop/XLM formatting, counts, outcome labels |
| `hooks/useSimulationExplainer.ts` | Network-aware React state machine |
| `components/SimulationExplainerPanel.tsx` | Composes idle, loading, success, error |
| `components/SimulationExplainerForm.tsx` | XDR textarea input |
| `components/SimulationExplainerResult.tsx` | Success/failure/restore rendering |
| `components/SimulationExplainerEmptyState.tsx` | Pre-interaction state |
| `fixtures/simulationExplainer.fixture.ts` | Deterministic envelopes and RPC responses |
| `msw/handlers.ts` | JSON-RPC mocks |
| `__tests__/` | Logic, schema, formatting, hook, component and accessibility tests |
| `e2e/simulation-explainer.spec.ts` | Executable behaviour spec |

## Safety

This tool never asks for, displays, stores or transmits a secret key. It only
pastes a public transaction envelope into the selected RPC node's public
`simulateTransaction` endpoint.
