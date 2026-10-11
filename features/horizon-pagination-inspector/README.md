# Horizon Pagination Response Inspector

Inspect pasted Horizon HAL collection responses offline to audit paging links, record identifiers, cursor tokens, and response integrity.

## What It Does

- **Collection Validation:** Validates standard Horizon collection envelopes containing `_embedded.records` and `_links`. Handles empty record arrays (`records: []`) as valid success states distinct from malformed shapes.
- **Identifier & Token Audit:** Examines every record to display its 0-based index, string ID, and string paging token without numeric coercion. Detects and flags duplicate IDs, duplicate paging tokens, and missing paging metadata.
- **Link Decomposition:** Parses `self`, `next`, and `prev` HAL links into endpoint paths, cursors, sort orders, and limits.
- **Preserves Raw Encoding:** Preserves raw percent-encoding on cursor values without premature decoding that could mutate opaque tokens.
- **Origin & Scheme Verification:** Accepts an optional expected base origin (e.g. `https://horizon.stellar.org`) and flags off-origin links. Detects untrusted schemes (`javascript:`, `data:`, `vbscript:`, `file:`) and templated URLs.
- **Secure Handling:** Never fetches or automatically navigates to response-supplied URLs. Disables link copy controls on non-HTTP(S) or templated schemes.
- **Deterministic Export:** Serializes the complete inspection audit to deterministic JSON for local diagnostics.
- **Secret Key Protection:** Rejects any input containing Stellar secret keys (`S...`) upfront and redacts them.

## Non-Obvious Decisions

- **Opaque Cursors:** Horizon cursors are opaque tokens, not arithmetic counters. They are parsed and displayed strictly as strings without numeric conversion or manipulation.
- **Single-Page Observation:** An offline diagnostic examines a single pasted response. A short page or zero records does not imply the collection has reached exhaustion unless the `next` link is absent.
- **Offline Isolation:** This tool operates completely offline without network requests (`offline: true`, `networks: []`). Response links are treated as untrusted data.
