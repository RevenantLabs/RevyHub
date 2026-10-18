# Account Activity Rollup

Summarizes an account's fetched Horizon operations by operation type and UTC ledger day. It works independently of the operation browser and supports testnet and mainnet.

## Data and boundary

The feature requests `GET /accounts/{account_id}/operations?order=desc&limit=20` and uses each operation's `created_at` ledger close timestamp. “Load next page” sends the last raw paging token as `cursor`. The page collector removes duplicate tokens within and across pages. The displayed page count is the number of successful fetches; the record count is the number of unique operations included. A full page indicates that older history *may* be available. An empty or partial page ends this browsing session, but does not prove a complete all-time history because Horizon can have a retention boundary.

The observed UTC day range is derived only from fetched operations. Day groups sort newest first; type groups sort by descending count and then alphabetically. The selected network is stored with each result, and switching networks hides an earlier result until a new request completes.

A successful empty page is distinct from a missing account (404), unavailable history (410, malformed response, or an account disappearing during pagination), a bad pagination cursor (400/422), and transport failure. Failed next-page requests preserve the already fetched aggregate so the user can retry.

Only public G-addresses are accepted. Secret-key input is blocked in the form and rejected before any request.

## Verification

Run unit, hook, component, and accessibility tests with `npm run test -- features/account-activity-rollup`. Run the two mocked browser journeys with `npx playwright test --config features/account-activity-rollup/e2e/playwright.config.ts` when Chromium is installed.
