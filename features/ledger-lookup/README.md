# Ledger Lookup

Inspect any Stellar ledger by its sequence number. Displays close time (both absolute UTC timestamp and relative age), successful and failed transaction counts, operation counts, total coins, fee pool, base fee, base reserve, and protocol version.

## How it works

The tool inspects network parameters via Horizon REST endpoints:

1. Horizon root document (`GET /`): retrieves the network's current ledger height (`history_latest_ledger` or `core_latest_ledger`) and history boundary.
2. Future sequence check: if the requested sequence exceeds the current ledger height, the request is rejected immediately with the current height stated, distinguishing pending ledgers from purged historical ledgers.
3. Horizon ledger endpoint (`GET /ledgers/{sequence}`): retrieves full ledger details and normalizes them into presentation metrics without floating-point precision loss.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Feature metadata, title, keywords and categorization |
| `types.ts` | TypeScript definitions for summaries, inputs, error taxonomy and state |
| `schema.ts` | Form input normalization and sequence number validation |
| `copy.ts` | User-facing copy, field labels, status messages and actionable error guidance |
| `lib/format.ts` | Non-lossy precision formatters for XLM amounts, stroops, timestamps and relative ages |
| `lib/ledgerLookup.ts` | Boundary-aware ledger lookup querying root height and ledger records |
| `lib/ledgerLookup.errors.ts` | Horizon transport error classifier mapping to ledger error codes |
| `hooks/useLedgerLookup.ts` | React state hook managing asynchronous query lifecycle and network sync |
| `components/LedgerLookupPanel.tsx` | Main panel rendering form, loading skeletons, error alerts and results |
| `components/LedgerLookupForm.tsx` | Accessible form component with network-aware hints |
| `components/LedgerLookupResult.tsx` | Metric list displaying counts, fees, protocol version and hashes |
| `components/LedgerLookupEmptyState.tsx` | Visual placeholder with feature guidance |
| `fixtures/ledgerLookup.fixture.ts` | Deterministic fixture data for testing |
| `msw/handlers.ts` | MSW mock handlers simulating Horizon API responses |
| `__tests__/` | Unit, hook, component and WCAG 2.1 A/AA accessibility tests |
| `e2e/ledger-lookup.spec.ts` | End-to-end user journey specification |

## Safety

This tool performs read-only queries against public Horizon instances. It never requests, stores, or handles secret keys.
