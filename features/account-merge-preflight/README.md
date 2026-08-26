# Account Merge Preflight Check

## What it does
Checks all prerequisites required for a Stellar account to be successfully merged into another account. This includes checking that the destination account exists, and the source account has no remaining trustlines, offers, data entries, sponsorship obligations, or extraneous signers.

## How it works
It fetches both the source and destination account details from Horizon, then fetches the offers for the source account. It evaluates each condition and returns an array of blocking items, or confirms the account is mergeable and provides the transferable XLM amount.

## Why
Account merge operations often fail due to hidden subentries (like data entries or open offers) that a user forgot to remove. This tool provides a clear, actionable list of exactly what needs to be removed before the merge can succeed, preventing opaque transaction failures.
