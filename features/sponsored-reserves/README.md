# Sponsored Reserves Inspector

Checks which of an account's subentries are sponsored and by whom, and which reserves the account is sponsoring for others.

## Design

This feature uses the `accounts` endpoint to determine sponsorships.
For "Sponsored By Others", we load the target account itself and inspect its root `sponsor` property as well as the `sponsor` property of its `balances` and `signers`.
For "Sponsoring For Others", we make a call to `accounts?sponsor={accountId}` to retrieve all accounts where the target account is paying for a reserve, and inspect the properties to determine if the account root, balance, or signer is sponsored.

Data and offers could theoretically be sponsored, but data sponsorships are not fully represented in the standard `accounts` endpoint and offers require a separate query per account, which goes beyond the standard basic subentry checks for an account viewer. 

## Structure
- `lib/sponsoredReserves.ts` fetches and organizes the sponsorships into two arrays.
- `components/SponsoredReservesResult.tsx` renders the results in two clean tables.
