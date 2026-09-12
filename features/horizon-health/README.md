# Horizon Endpoint Health Diagnostic

Inspects the configured Horizon endpoint's version, ingestion lag, history range, and rate-limit headroom to verify that queries will return fresh data.

## How it works

Horizon publishes its operational status at the root endpoint (`GET /`):

- **Ingestion lag**: Compares `core_latest_ledger` with `ingest_latest_ledger`. If Horizon falls behind Stellar Core by more than 3 ledgers, the endpoint is flagged as `degraded`.
- **History range**: Displays the full ledger span (`history_elder_ledger` to `history_latest_ledger`) available for querying on this instance.
- **Rate-limit headroom**: Extracts `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` from the HTTP response headers when present, and reports them as absent when omitted by the server or proxy.
- **Software versions**: Reports `horizon_version` and `core_version` for auditability across network upgrades.

## Degrading rather than failing

`degraded` represents a successful HTTP request with concerning operational metrics. Rather than collapsing the response into an opaque error screen, the tool renders all underlying figures (core ledger, ingest ledger, gap, versions) alongside an explanatory warning. This allows operators to diagnose whether the node is catching up or stalling.

## Precision

Ledger sequence numbers are integers. All sequence values are parsed and rendered via `BigInt` formatting without floating-point math.

## Safety

This tool performs read-only `GET` requests against the configured Horizon endpoint for the selected network. No transactions or secret keys are accepted, stored, or transmitted.
