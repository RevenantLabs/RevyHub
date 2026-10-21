# Operation Result XDR Decoder

Enter a public 64-character transaction hash on testnet or mainnet. The tool fetches the settled record from Horizon, decodes `result_xdr` locally with the Stellar SDK, and fetches that transaction's operation list with `include_failed=true` only when the result contains operation rows. It pairs the rows by position and verifies that each XDR operation arm agrees with Horizon's operation type. Missing or mismatched lists fail closed instead of showing a misleading type.

Fee-bump results have an outer fee-payer verdict and an inner transaction result. Both codes are shown, while operation rows and the primary verdict use the inner result. A transaction-level rejection has no operation result rows; it is displayed separately from a `tx_failed` result with operation rows. Stellar transactions are atomic: a failed operation does not commit preceding changes.

Only the hash is sent to Horizon. The tool accepts no secret key, signs nothing, and submits nothing. XDR is length-limited before local decoding. Horizon pagination is followed when result rows exceed one page. Errors include malformed XDR, missing transactions, mismatched operation lists, rate limits, and other transport failures.

Result meanings follow the [Stellar Horizon result-code reference](https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes). The [operation endpoint](https://developers.stellar.org/docs/data/apis/horizon/api-reference/retrieve-a-transactions-operations) requires `include_failed=true` to return failed operations.

## Browser tests

Run `npm run build` first, then `npx playwright test --config features/operation-result-xdr-decoder/playwright.config.ts`. The feature's Playwright config starts the production server on port 3088 so the browser tests do not depend on the development file watcher.
