# Muxed Payment Routing Audit

Enter one public base `G` address and select testnet or mainnet. The tool reads Horizon `GET /accounts/{account_id}/payments` in descending order, up to three pages of 20 operations. It reports pages fetched and always labels totals as a bounded history sample. A full final page may have older records; the tool makes no claim of complete history.

Only incoming payment, path payment, and account creation operations with a destination matching the entered base account are totaled. Outgoing operations and account merges are skipped because a merge has no fixed amount in this response. For each included operation, the destination muxed address and ID must both be present and agree with the base account; neither source fields nor transaction metadata supply a route. When both muxed fields are absent, the operation belongs to the direct base-address group. A partial or inconsistent muxed pair fails closed as malformed data. No custodial balance or recipient ownership is inferred.

Amounts are parsed into `BigInt` stroops, summed separately for each destination ID plus asset code and issuer, then formatted back to decimal strings. An invalid account or secret-seed prefix is rejected before any fetch. A broken page, cursor, or payment stops the audit rather than showing partial totals. Requests use only public account addresses; this feature never signs or submits a transaction.

MSW fixtures cover native and issued payments, distinct muxed IDs, direct payments, outgoing filtering and errors. The browser journey specifications live in `e2e/`.
