# Multi-Account Asset Exposure Matrix

Enter 2–10 unique public G addresses to compare their Horizon balances on testnet or mainnet. The tool reads GET /accounts/{account_id} with a three-request concurrency cap. It never asks for or sends a secret seed.

## Identity and arithmetic

Native XLM and classic credit balances appear in the matrix. A credit asset is identified by **code plus issuer**; two USD trustlines from different issuers are different rows. Liquidity pool shares are omitted because a pool ID is not a classic asset issuer. Amounts are decoded as seven-decimal strings, summed as BigInt stroops, and rendered without floating-point conversion.

Account columns keep the entered order. Asset rows sort with XLM first, then code and issuer. A missing trustline and a failed account both have blank cells; the account status section distinguishes them. Totals include only returned balances and are labeled observed totals when a request fails.

## Errors and export

Validation runs before requests and rejects seeds by prefix, malformed addresses, duplicates, and more than ten accounts. Each Horizon request yields a loaded row or an actionable account error. A 404 is account_not_found, 429 is rate_limited, and failed transport or malformed responses are request_failed.

The downloadable CSV contains only public account IDs, asset identities, exact amounts and error codes. Columns follow the input order, asset rows follow the matrix order, and an account_status row makes partial failure explicit. Empty cells never claim a zero balance. CSV values are escaped; no prices or fiat values are inferred.
