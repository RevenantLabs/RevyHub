# Stellar Basics

This page explains the Stellar concepts used by RevyHubX.

## Public Keys

Stellar public account IDs start with `G`. They are safe to share and are the only account identifiers this app accepts. Secret keys and seed phrases should never be entered into this app.

## Testnet and Mainnet

Testnet is for development and resets periodically. Testnet XLM has no market value and can be requested through Friendbot.

Mainnet is the live Stellar network. The app can query mainnet Horizon for balances, trustlines, and transactions, but the faucet remains testnet-only.

## Horizon

Horizon is Stellar's HTTP API. This project uses Horizon to load account balances, trustlines, and transaction summaries.

## Native XLM

XLM is Stellar's native asset. It does not have an issuer address.

## Issued Assets and Trustlines

Issued assets have an asset code and an issuer account. A Stellar account must create a trustline before it can hold most issued assets.

The Trustline Checker asks for:

- Account address
- Asset code
- Issuer address

### USDC Preset

The Trustline Checker includes a network-aware **USDC by Circle** preset. Selecting it fills the asset code and the official issuer for the network selected in the app header:

- Testnet: `USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- Mainnet: `USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`

The issuer addresses are published in [Stellar's supported USDC asset table](https://developers.stellar.org/docs/build/agentic-payments/x402#supported-assets).

These are separate Stellar assets and their trustlines are not interchangeable. Testnet USDC is only for development and has no real-world value; a testnet trustline does not mean the same account has a mainnet USDC trustline. Always confirm the selected network before checking an account. Use **Custom issued asset** when checking a different code or issuer.

## Transactions

Transactions are identified by 64-character hexadecimal hashes. The Transaction Lookup tool validates the hash shape before querying Horizon and links to Stellar Expert for deeper inspection.

## Wallets

Freighter is a browser wallet for Stellar. This project only requests a public key and network information. It does not request signatures, secret keys, or transaction submission.
