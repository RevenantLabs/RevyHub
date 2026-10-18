# Horizon Endpoint Health Diagnostic

Checks the selected network's configured Horizon root once and displays Core and
Horizon ledger heights, ingestion gap, retained history, software versions and
rate-limit headers. It accepts no account, URL or secret key and performs no writes.

## How it works

Uses the shared `horizonUrl` configuration and a raw fetch because the diagnostic
needs response headers. The shared request wrapper bounds the entire request and
JSON decoding to ten seconds. Invalid JSON and malformed root fields are distinct
from connectivity and HTTP failures. A reversed retained-history range is invalid.

Lag is `max(0, core_latest_ledger - history_latest_ledger)`; more than **5 ledgers**
is degraded. Degradation stays a successful result with a warning so its evidence
remains visible. This chosen threshold is diagnostic, not an availability promise.
Root heights may be sampled at slightly different times; a negative observed gap
is clamped to zero. Header values retain the provider's original units. Missing
headers can mean absent headers or CORS restrictions, never a zero allowance.

Results include endpoint and UTC observation time. Network tagging hides stale
results immediately; reset and newer requests abort and discard pending results.
There is no polling or persistence. Fixtures are fixed root documents with no
invented addresses. MSW covers failures, timeout, header absence/zero and lag
boundaries; DOM and hook tests cover reset, retry and network changes. Axe covers
initial and result states. The E2E file describes browser steps; no browser runner
is configured in the repository.

Run `npm run check` and `npm run verify:features -- horizon-health`.
