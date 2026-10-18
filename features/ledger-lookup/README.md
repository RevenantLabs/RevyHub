# Ledger Lookup

Looks up a positive uint32 ledger sequence on the selected configured Horizon
network. Reads the root first: a sequence beyond `history_latest_ledger` reports
the current height, while one below `history_elder_ledger` reports unavailable
history without making a pointless ledger request. The current height is the
provider's ingested height, so ingestion delay may require waiting too.

The shared URL configuration and bounded request helper read `/` and `/ledgers/{sequence}`.
Close time is displayed in UTC with age anchored to the labeled observation time,
not a ticking or inferred historical clock. Successful and failed transaction
counts remain separate. XLM amounts remain exact strings; integer stroop values
are rendered with their units. Missing optional fields are unavailable, never zero.

No transaction listing, paging, polling, arbitrary endpoint, secret key, signing,
submission or persistence. Edits and reset cancel pending results; network-scoped
state prevents a result from being shown on another network. MSW exercises root
and ledger failures, retained-history boundaries, exact amounts and missing data.
Axe covers initial and success states. E2E steps are a reviewable specification;
the repository does not configure a browser runner.

Run `npm run check` and `npm run verify:features -- ledger-lookup`.
