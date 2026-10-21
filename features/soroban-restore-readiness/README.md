# Soroban Storage Restore Readiness

Given a contract ID, a storage key, and the key's durability, this tool reads
the matching `contract_data` ledger entry via Soroban RPC `getLedgerEntries`
and reports whether it is **live**, **past its live-until ledger but not yet
evicted**, **archived**, or — for a `temporary` entry — **expired and
deleted outright**. For a restorable persistent entry it explains what a
`RestoreFootprint` operation would need, without constructing one.

## How it works

**Data source:** Stellar RPC `getLedgerEntries` for the supplied storage key
on the network selected in the header. The lookup is read-only; this tool
never signs or submits a transaction.

1. `schema.ts` validates the contract ID (rejecting anything that looks like
   a secret key on sight) and the storage key, which is entered as
   base64-encoded `ScVal` XDR — the exact value used as the `contract_data`
   key. A dropdown selects the entry's durability.
2. `lib/entry-state-fetch.ts` builds the `LedgerKey` XDR for that
   `(contract, key, durability)` triple and calls `getLedgerEntries`.
3. `lib/archival-classify.ts` turns the response into one of four liveness
   states (see "The non-obvious decision" below).
4. `lib/restore-requirements.ts` explains whether the entry is restorable and,
   if so, names the exact footprint a `RestoreFootprint` operation would need.

## The non-obvious decision

A single `getLedgerEntries` call cannot always prove *why* a key is absent —
RPC does not promise to tell "never existed" apart from "archived and fully
evicted" for every provider and protocol version. Rather than guess, this
tool uses two signals together:

- **The response shape.** A row with no `liveUntilLedgerSeq` field models the
  archive layer returning an entry's last known data with no current TTL —
  treated as `archived` for a `persistent` key. An empty `entries` array for
  a `persistent` key has no such marker, so it is surfaced as the
  `entry_not_found` **error**, with copy that says plainly that this tool
  cannot distinguish "never existed" from "evicted without a trace" here.
- **The durability the caller declared.** Temporary entries are deleted
  outright once expired — they never reach the archive — so for a
  `temporary` key, an empty response (or a stale row) is not an error at
  all. It is the expected, informative `expired_temporary` **result**: gone,
  and never restorable, which is exactly what the acceptance criteria asks
  this tool to say.

This is why durability is part of the input rather than inferred: the same
RPC response shape means something different depending on it.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata and supported networks |
| `schema.ts` | Input parsing and validation |
| `lib/entry-state-fetch.ts` | Builds the ledger key and calls `getLedgerEntries` |
| `lib/archival-classify.ts` | Classifies live / pending-eviction / archived / expired-temporary |
| `lib/restore-requirements.ts` | Explains restore requirements for the key |
| `lib/sorobanRestoreReadiness.ts` | Orchestrates the above into one `Result` |
| `lib/sorobanRestoreReadiness.errors.ts` | Maps RPC/transport failures to error codes |
| `lib/format.ts` | Presentation formatting |
| `hooks/` | React state machine |
| `components/` | Form, result, badge, restore-requirement and empty/error UI |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data, including the archived and expired-temporary edge cases |
| `msw/` | Request mocks |
| `e2e/` | Declarative end-to-end specifications |

## Safety

This tool never accepts, displays, stores or transmits a secret key. The
contract ID field rejects any value starting with `S` on sight, before any
request is built, and the rejection is covered by a test asserting the
secret never appears in component output or hook state.
