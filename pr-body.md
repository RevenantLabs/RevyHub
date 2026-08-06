## Summary

Fetch and display the operations included in a Stellar transaction.

Closes #10

## Changes

### `lib/stellar/transaction.ts`
- Added `NormalizedOperation` interface covering **20+ Stellar operation types** with all key fields (payment amounts, account addresses, asset codes, offer prices, data entries, etc.)
- Added `fetchTransactionOperations(hash, network)` — fetches operations from Horizon via `server.operations().forTransaction(hash).call()`
- Updated `lookupTransaction` to fetch operations alongside the transaction using a **resilient pattern** — if the operations endpoint fails transiently, the transaction details are still displayed
- Removed the `TODO(issue #10)` marker

### `components/stellar/TransactionDetails.tsx`
- Added `OperationCard` — displays an operation type badge and type-specific fields
- Added `OperationsPanel` — shows operation count badge, the list of `OperationCard`s, and a themed empty state
- Updated `TransactionDetails` to include the operations section below the transaction summary
- Long address fields use `CopyableValue` for truncation and copy-to-clipboard

### `tests/stellar/transaction.test.ts`
- Added **6 new tests** for `normalizeOperation` covering payment, create_account, change_trust, manage_data, unknown types, and empty input

## Validation

- ✅ Lint passes (`npm run lint`)
- ✅ All 18 tests pass (`npm test`)
- ✅ Production build succeeds (`npm run build`)

## Acceptance criteria met

- [x] Operations are fetched from Horizon
- [x] Operation type is displayed
- [x] Important operation fields are shown
- [x] Empty operation state is handled
- [x] Errors are handled properly
