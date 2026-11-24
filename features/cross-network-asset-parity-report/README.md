# Cross-Network Asset Metadata Parity Report

Compares issuer flags, home domains, and asset identity for pairs you write down. Each side names its own network, asset code, and issuer. The same code under two issuers stays two assets.

## How it works

For each side the report reads the Horizon account and the matching asset record. Flags that the account omits stay "not declared". A 404 stays a missing side inside the report. A 500 on one side stays unavailable. The report fails outright only when every side is rate limited or every side fails. Home domains that disagree are a difference, not an error. Ledger number, retrieval time, network, and the provider are shown with each side.

## Limits

At most 10 pairs. No prices, no automatic issuer mapping, and no claim that two assets are economically the same. Native XLM is refused because it has no issuer.

## Safety

This tool never asks for a secret key. A secret-seed-shaped token is rejected and is not copied into the result. It only sends the account id and asset code you already typed to Horizon.
