# Account Offers Inspector

Inspect all open offers for a Stellar account, including selling/buying assets, amounts, and prices.

## What it does

- Enter a Stellar account address (G...)
- View all open offers with:
  - Offer ID
  - Selling asset and amount
  - Buying asset
  - Price (n/d ratio)
  - Last modified time and ledger

## Design decisions

- **Network-aware**: Reads offers from the currently selected Stellar network (testnet/mainnet)
- **MSW mocked**: Tests use deterministic fixtures instead of live Horizon calls
- **Loading state**: Shows loading indicator while fetching from Horizon

## Error handling

- Invalid address → specific error message
- Account not found → 404 from Horizon
- Rate limited → wait guidance
- Network failure → retry suggestion
