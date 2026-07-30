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

## Transaction and Operation Result Codes

Stellar reports outcomes as short codes such as `tx_bad_seq` or `op_underfunded`. These codes are precise but not self-explanatory, so `lib/stellar/resultCodes.ts` maps known codes to a plain-language title, explanation, and a non-prescriptive recovery hint. The original code is always shown alongside the explanation — nothing is hidden or replaced.

- **Source**: [Stellar's result code reference](https://developers.stellar.org/docs/data/horizon/api-reference/errors/result-codes/transactions), covering transaction-level codes and the payment/trustline operation codes this app surfaces.
- **Version**: `STELLAR_RESULT_CODES_VERSION` in `lib/stellar/resultCodes.ts` marks when the mapping was last reviewed against the source above.
- **Update process**: when Stellar adds, renames, or clarifies a result code, add or edit its entry in the relevant table in `lib/stellar/resultCodes.ts` and bump `STELLAR_RESULT_CODES_VERSION`. A duplicate-key guard runs at import time and throws if a code ends up defined in more than one table.
- **Unknown codes**: any code not yet in the mapping still renders, labeled as unrecognized, with a hint to check the official reference rather than being guessed at or mislabeled.
- This mapping does not decode the raw result XDR — it only explains string codes that Horizon already returns (for example via `extras.result_codes` on a rejected submission).

## Wallets

Freighter is a browser wallet for Stellar. This project only requests a public key and network information. It does not request signatures, secret keys, or transaction submission.
