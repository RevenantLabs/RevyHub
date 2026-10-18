# Claimable Balance Deadline Board

The board lists a claimant's **current** claimable balances from Horizon `GET /claimable_balances?claimant=...`. It requests at most three ascending pages of 200 and reports the number actually fetched. An optional numeric Horizon paging token allows a later scan. Repeated paging tokens are deduplicated. The displayed last token can be used to continue, although a changing ledger can change what a later scan sees.

Only a lone `abs_before` leaf has a known expiry from standard Horizon claimable balance records. A lone `rel_before` leaf can have an expiry when a caller provides a verified creation timestamp to the parser. The page response's `last_modified_time` is **not** used: sponsorship or other updates can change it. `abs_after` and `rel_after` are start conditions, not expiries. AND/OR/NOT trees retain their full shape and appear in the indeterminate section even if a leaf has a time condition; flattening such a tree would misrepresent its semantics.

A passed condition means its clock bound has passed, not that the balance was claimed. The balance is still in Horizon's current list. Likewise, an empty list does not establish a claim, cancellation, or historical absence. This tool makes no transactions and accepts only public G addresses.

Tests use MSW fixtures for successful, malformed, rate-limited and historical responses. Run the two intercepted browser journeys with `npx playwright test --config features/claimable-balance-deadline-board/playwright.config.ts` when Chromium is available.
