# Asset Supply and Holder Statistics

This slice implements the tool to view circulating supply, trustline holder statistics, and issuer flags for any Stellar asset.

## Logic and Patterns

1. **Horizon Query**: We use `horizonServer(network).assets().forCode(assetCode).forIssuer(issuerId).call()` to find the exact asset record.
2. **Formatting**: Amounts are returned in stroops or directly 7-decimal values from Horizon, formatted securely to avoid precision loss in JavaScript `Number`.
3. **State Management**: Using `useAssetStatistics` pattern inherited from `trustline-checker`, supporting idle, loading, success, and error states.
4. **Validation**: Enforces proper alphanumeric constraints on the asset code, and Ed25519 public key checks for the issuer.
