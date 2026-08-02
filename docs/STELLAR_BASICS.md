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

## Transactions

Transactions are identified by 64-character hexadecimal hashes. The Transaction Lookup tool validates the hash shape before querying Horizon and links to Stellar Expert for deeper inspection.

## Liabilities

When an account places offers on the Stellar decentralized exchange (buying or selling an asset), Horizon reports those pending obligations as **buying liabilities** and **selling liabilities**. The displayed balance minus liabilities reflects the amount the account can currently spend or trade.

The Balance Viewer exposes these values in an expandable section on each asset card so developers can see why the full balance may not be spendable. A value of zero is shown compactly as "No outstanding liabilities".

Liabilities are informational; they do not modify account state or represent debt in the traditional financial sense.

## Wallets

Freighter is a browser wallet for Stellar. This project only requests a public key and network information. It does not request signatures, secret keys, or transaction submission.
