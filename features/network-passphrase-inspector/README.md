# Network Passphrase Inspector

Browse Stellar network passphrases, their properties, and Horizon RPC URLs.

## What it does

- View all Stellar networks (mainnet, testnet, futurenet)
- See passphrases, Horizon URLs, and Soroban RPC support
- Search by name, type, or passphrase

## Design decisions

- **Fully offline**: No network requests. All data is embedded.
- **Network types**: Supports mainnet, testnet, futurenet, and custom networks.
- **Reference only**: Read-only tool, no state changes.

## Error handling

- Invalid filter → specific error
- No results → empty state with guidance
