# Contract Storage and TTL Inspector

Reads a Soroban smart contract's instance storage from the selected network's
RPC node and reports the time-to-live (TTL) of each entry. Entries that have
already expired are flagged as archived.

## How it works

The tool makes two Soroban RPC calls:

1. `getLedgerEntries` for the contract's `LedgerKeyContractInstance` ledger
   key. This single entry contains the contract WASM reference and the entire
   instance storage map.
2. `getLatestLedger` to turn each entry's absolute `liveUntilLedgerSeq` into a
   ledgers-remaining count.

Instance storage entries all share the same TTL because they live inside the
same ledger entry. Persistent and temporary entries are stored as separate
ledger entries keyed by their individual storage keys, so they cannot be
enumerated from the contract ID alone. The UI explains this limitation rather
than hiding it.

Ledger close time is assumed to be ~5 seconds per ledger and is presented as an
estimate, not a fact.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata |
| `schema.ts` | Validates a raw contract ID string |
| `lib/contractStorage.ts` | Builds the ledger key, calls RPC, parses XDR |
| `lib/contractStorage.errors.ts` | Transport/RPC failures → slice error codes |
| `lib/format.ts` | TTL wall-clock estimates and entry grouping |
| `hooks/useContractStorage.ts` | React state machine |
| `components/ContractStoragePanel.tsx` | Composes idle, loading, success, error |
| `components/ContractStorageForm.tsx` | Contract ID input |
| `components/ContractStorageResult.tsx` | Storage table with TTL |
| `components/ContractStorageEmptyState.tsx` | Pre-interaction state |
| `fixtures/contractStorage.fixture.ts` | Deterministic contract IDs and XDR |
| `msw/handlers.ts` | JSON-RPC mocks |
| `__tests__/` | Logic, schema, formatting, hook, component and a11y tests |
| `e2e/contract-storage.spec.ts` | Executable behaviour spec |

## Safety

This tool never asks for, displays, stores or transmits a secret key. It only
reads public ledger data through the RPC node.
