# Testnet and Mainnet Comparison

Reads the configured testnet and mainnet Horizon root documents and latest ledger
collections concurrently. Protocol, base fee and base reserve come from each
observed ledger, labeled with its sequence and UTC observation time. Missing fields
stay unavailable; integer fees use exact strings. Heights are never subtracted
between networks. Within each network, Core minus ingested height shows ingestion
lag, clamped at zero for sampling races.

Each network's root and ledger form one column. One failed request makes only that
column unavailable; the other remains visible with partial-failure advice. If both
columns fail the hook enters its error state. The shared URL configuration is used
without adding endpoints. Each column is bounded to ten seconds. No polling,
custom network input, account data, secret keys, writes or persistence are involved.

The header network switch intentionally has no effect, explained in the form.
These are independent observations, not an atomic snapshot. Testnet reset guidance
explains why yesterday's resources may disappear. Reset/new submissions discard
pending results. MSW tests cover concurrency, partial/total failures, missing values,
and independent heights; DOM tests and axe cover initial and result states.

Run `npm run check` and `npm run verify:features -- network-comparison`.
