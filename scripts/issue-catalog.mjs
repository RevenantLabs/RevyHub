/**
 * The RevyHubX tool catalogue.
 *
 * Every entry becomes one GitHub issue asking for one complete feature slice
 * (see docs/FEATURE_CONTRACT.md). Entries are deliberately independent: no two
 * tools share a data source *and* a UI surface, and none of them requires
 * editing a file another one touches.
 *
 * Fields
 * ------
 * slug        directory name under features/ — also the URL segment
 * title       tool name
 * category    one of core/registry/types.ts FEATURE_CATEGORIES
 * difficulty  medium | advanced
 * summary     what to build, 2-3 sentences
 * why         why it belongs in the toolkit
 * source      where the data comes from (endpoint, SDK call, or "local only")
 * offline     true when the tool makes no network request
 * criteria    acceptance criteria beyond the shared contract
 * codes       [errorCode, whenItHappens] pairs the slice must handle
 * reference   an existing slice with the closest shape
 * notes       the non-obvious trap in this particular tool
 * outOfScope  what NOT to build
 */

export const catalog = [
  // ---------------------------------------------------------------- accounts
  {
    slug: "account-signers",
    title: "Account Signers and Thresholds",
    category: "accounts",
    difficulty: "medium",
    summary:
      "Show every signer on an account with its weight and type, alongside the low, medium and high thresholds, and state plainly which operations each threshold gates.",
    why:
      "Multisig setups are easy to get wrong and hard to read from raw Horizon JSON. Seeing weights next to the thresholds they have to clear is the whole point.",
    source: "Horizon `GET /accounts/{account_id}` — the `signers` and `thresholds` fields.",
    criteria: [
      "Every signer is listed with its key, weight and type (`ed25519_public_key`, `sha256_hash`, `preauth_tx`, `ed25519_signed_payload`).",
      "The master key signer is labelled as such, and a master weight of 0 is called out explicitly as a disabled master key.",
      "Low, medium and high thresholds are shown with a one-line description of which operation categories each one gates.",
      "The total weight of all signers is compared against each threshold, and a threshold that can never be met is flagged.",
      "A single-signer account with default thresholds is described as a normal, non-multisig account rather than shown as a bare table."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "A master weight of 0 means the account can no longer sign for itself. That is a deliberate configuration, not an error, but it must be visible — it is the difference between a locked-down issuing account and a mistake.",
    outOfScope: [
      "Do not build a transaction that changes signers or thresholds.",
      "Do not evaluate whether a specific transaction has enough signatures — that is its own tool."
    ]
  },
  {
    slug: "account-data-entries",
    title: "Account Data Entry Viewer",
    category: "accounts",
    difficulty: "medium",
    summary:
      "List the key/value data entries attached to an account, decoding each base64 value and showing whether it is readable text or raw bytes.",
    why:
      "Data entries are how many Stellar apps store per-account state, but Horizon returns them base64-encoded, which makes them unreadable during debugging.",
    source: "Horizon `GET /accounts/{account_id}` — the `data` object.",
    criteria: [
      "Every entry is listed with its key and decoded value.",
      "A value that decodes to printable UTF-8 is shown as text; anything else is shown as hex with its byte length.",
      "The raw base64 is available alongside the decoded form, and both are copyable.",
      "An account with no data entries gets a clear empty result, distinct from an account that does not exist.",
      "Decoding never throws: a value that is not valid base64 is reported as such for that row only, leaving other rows readable."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "Deciding 'is this text?' needs care. Check that the decoded bytes round-trip through UTF-8 and contain no control characters — a value that merely happens to decode without throwing is not necessarily text.",
    outOfScope: [
      "Do not write or delete data entries.",
      "Do not attempt to parse application-specific formats such as JSON stored inside a value."
    ]
  },
  {
    slug: "reserve-calculator",
    title: "Minimum Balance and Reserve Calculator",
    category: "accounts",
    difficulty: "medium",
    summary:
      "Compute the minimum XLM balance an account must keep, breaking it down by base reserve, subentries, and sponsorship, and show how much of the balance is actually spendable.",
    why:
      "'Why can't I send all my XLM?' is one of the most common Stellar questions. The answer is the reserve, and it is invisible in a plain balance view.",
    source:
      "Horizon `GET /accounts/{account_id}` for `subentry_count`, `num_sponsoring` and `num_sponsored`, plus the current base reserve from `GET /ledgers?order=desc&limit=1`.",
    criteria: [
      "The minimum balance is computed as `(2 + subentry_count + num_sponsoring - num_sponsored) x base_reserve`.",
      "The result is broken down line by line: base account reserve, each subentry, sponsorship adjustments.",
      "Spendable balance is shown as the native balance minus the reserve minus selling liabilities, and is never rendered as negative.",
      "The base reserve is read from the live ledger rather than hard-coded, and the ledger it came from is named.",
      "An account whose balance is below its own minimum is called out explicitly."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "All of this arithmetic must run in `BigInt` stroops. Doing it in floats produces answers that are wrong in the seventh decimal place, which is exactly where the reserve question gets asked.",
    outOfScope: [
      "Do not build a transaction that merges or funds the account.",
      "Do not attempt to predict future reserve changes from protocol upgrades."
    ]
  },
  {
    slug: "sponsored-reserves",
    title: "Sponsored Reserves Inspector",
    category: "accounts",
    difficulty: "advanced",
    summary:
      "Show which of an account's subentries are sponsored and by whom, and which reserves the account is sponsoring for others.",
    why:
      "Sponsorship moves the reserve cost of a subentry to another account. Without a view of it, an account's reserve maths looks inexplicable.",
    source:
      "Horizon `GET /accounts/{account_id}` for the counts, and the `sponsor` field present on balances, signers, offers and data entries.",
    criteria: [
      "Every sponsored subentry is listed with its kind and its sponsoring account.",
      "The account's own sponsorship obligations (`num_sponsoring`) are listed separately from what is sponsored for it (`num_sponsored`).",
      "The net reserve effect of sponsorship is stated in XLM.",
      "An account with no sponsorship relationships gets a clear, specific empty state rather than three empty tables.",
      "Sponsor addresses are copyable and truncated consistently."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "The `sponsor` field appears on several different subentry types with the same name but different surrounding shapes. Normalise them into one row type before rendering, the way `normalizeBalance` does.",
    outOfScope: [
      "Do not create or revoke sponsorships.",
      "Do not follow the sponsor chain recursively — one level is the tool."
    ]
  },
  {
    slug: "sequence-inspector",
    title: "Sequence Number Inspector",
    category: "accounts",
    difficulty: "medium",
    summary:
      "Show an account's current sequence number, the next valid sequence, and how a bump-sequence operation would change it, including the ledger-derived maximum.",
    why:
      "Sequence mismatches are a leading cause of `tx_bad_seq`, and the arithmetic involved is larger than JavaScript numbers handle safely.",
    source: "Horizon `GET /accounts/{account_id}` — `sequence` and `sequence_ledger`.",
    criteria: [
      "Current and next sequence numbers are shown exactly, using `BigInt` end to end.",
      "The ledger-and-offset structure of the sequence number is explained (the high bits are the ledger the account was created in).",
      "A bump target can be entered and is validated as greater than the current sequence and within int64 range.",
      "`tx_bad_seq` is explained in terms of the values shown.",
      "Copying the next sequence number gives the exact digits, with no scientific notation and no rounding."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["invalid_bump_target", "the bump target is not a positive int64 above the current sequence"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "Sequence numbers routinely exceed `Number.MAX_SAFE_INTEGER`. Every value here must stay a string or a `BigInt` from the JSON boundary to the DOM — one `Number()` anywhere silently corrupts the answer.",
    outOfScope: [
      "Do not build or submit a bump-sequence transaction.",
      "Do not manage channel accounts."
    ]
  },
  {
    slug: "account-merge-preflight",
    title: "Account Merge Preflight Check",
    category: "accounts",
    difficulty: "advanced",
    summary:
      "Check whether an account can actually be merged into a destination, listing every condition that currently blocks it.",
    why:
      "Account merge fails for a handful of specific reasons — remaining subentries, open offers, the wrong signer weight — and the on-chain error codes do not say which.",
    source:
      "Horizon `GET /accounts/{account_id}` for both source and destination, plus `GET /accounts/{account_id}/offers`.",
    criteria: [
      "Each merge precondition is checked and reported individually: no trustlines, no offers, no data entries, no sponsorship obligations, sufficient signer weight, destination exists.",
      "Every blocking condition names the concrete thing blocking it, for example the asset code of a remaining trustline.",
      "A mergeable account is reported as mergeable, with the XLM that would transfer.",
      "The destination is checked for existence separately from the source, with its own message.",
      "Source and destination being the same account is rejected before any request."
    ],
    codes: [
      ["empty_source", "no source address submitted"],
      ["invalid_source", "source fails the StrKey checksum"],
      ["empty_destination", "no destination address submitted"],
      ["invalid_destination", "destination fails the StrKey checksum"],
      ["same_account", "source and destination are identical"],
      ["source_not_found", "the source account does not exist on this network"],
      ["destination_not_found", "the destination account does not exist on this network"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "This tool has two address inputs, so field-level error reporting matters more than usual: 'account not found' is useless unless it says which of the two.",
    outOfScope: [
      "Do not build, sign or submit a merge transaction.",
      "Do not offer to close trustlines or cancel offers."
    ]
  },

  // ------------------------------------------------------------------ assets
  {
    slug: "asset-metadata",
    title: "Asset Metadata from stellar.toml",
    category: "assets",
    difficulty: "advanced",
    summary:
      "Given an asset code and issuer, find the issuer's home domain, fetch its `stellar.toml`, and show the declared metadata for that asset.",
    why:
      "SEP-1 is how an asset says what it is. Reading it by hand means finding the home domain, guessing the well-known path and parsing TOML.",
    source:
      "Horizon `GET /accounts/{issuer}` for `home_domain`, then `https://{home_domain}/.well-known/stellar.toml`.",
    criteria: [
      "The issuer's home domain is resolved from Horizon rather than typed by the user.",
      "The `[[CURRENCIES]]` entry matching the asset code and issuer is located and displayed; a toml that lists other assets but not this one is a distinct, named outcome.",
      "Declared fields — name, description, image, decimals, status, `is_asset_anchored` — are shown when present and clearly marked absent when not.",
      "An issuer with no home domain is reported as such, with an explanation that the asset publishes no metadata.",
      "The toml is fetched over HTTPS only, and a non-HTTPS home domain is refused."
    ],
    codes: [
      ["empty_asset_code", "no asset code submitted"],
      ["invalid_asset_code", "not 1-12 alphanumeric characters"],
      ["empty_issuer", "no issuer submitted"],
      ["invalid_issuer", "issuer fails the StrKey checksum"],
      ["issuer_not_found", "the issuing account does not exist on this network"],
      ["no_home_domain", "the issuer declares no home domain"],
      ["toml_unreachable", "the toml could not be fetched"],
      ["toml_invalid", "the response was not parseable TOML"],
      ["asset_not_listed", "the toml is valid but does not list this asset"]
    ],
    reference: "features/trustline-checker",
    notes:
      "Everything in the toml is attacker-controlled — the issuer publishes it. Render every field as text, never as markup, and never fetch a URL the toml supplies. Declared metadata says what the issuer claims, not what is true.",
    outOfScope: [
      "Do not implement SEP-6, SEP-24 or SEP-31 endpoint discovery — that is its own tool.",
      "Do not render remote images from the toml."
    ]
  },
  {
    slug: "asset-statistics",
    title: "Asset Supply and Holder Statistics",
    category: "assets",
    difficulty: "medium",
    summary:
      "Show circulating supply, number of accounts holding an asset, and the split between authorized, unauthorized and liabilities-only trustlines.",
    why:
      "Deciding whether an asset is real and in use starts with how many accounts hold it and how much of it exists.",
    source: "Horizon `GET /assets?asset_code={code}&asset_issuer={issuer}`.",
    criteria: [
      "Circulating amount and holder counts are shown, broken down by authorization state.",
      "The claimable-balance and liquidity-pool portions of supply are shown separately from account balances.",
      "Issuer authorization flags (`auth_required`, `auth_revocable`, `auth_immutable`, `auth_clawback_enabled`) are listed with a one-line meaning for each.",
      "An asset code and issuer pair that Horizon does not know is a specific, named outcome, not a generic error.",
      "All amounts keep full 7-decimal precision."
    ],
    codes: [
      ["empty_asset_code", "no asset code submitted"],
      ["invalid_asset_code", "not 1-12 alphanumeric characters"],
      ["empty_issuer", "no issuer submitted"],
      ["invalid_issuer", "issuer fails the StrKey checksum"],
      ["asset_not_found", "Horizon returns no record for this pair"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "`/assets` returns a paged collection even for an exact code+issuer query. An empty `_embedded.records` array is the 'not found' case — there is no 404 to catch here.",
    outOfScope: [
      "Do not list individual holders.",
      "Do not chart supply over time."
    ]
  },
  {
    slug: "liquidity-pool-inspector",
    title: "Liquidity Pool Inspector",
    category: "assets",
    difficulty: "advanced",
    summary:
      "Look up a liquidity pool by its ID and show its reserves, total shares, participant count, fee and the implied price in both directions.",
    why:
      "Pool IDs appear in balances and trades as opaque 64-character hashes with nothing to resolve them against.",
    source: "Horizon `GET /liquidity_pools/{liquidity_pool_id}`.",
    criteria: [
      "Both reserve assets are shown with amounts, and the native asset is labelled as XLM rather than left blank.",
      "The implied price is shown in both directions, computed from the reserves.",
      "Total shares, trustline count and the fee in basis points are displayed.",
      "The pool ID input is validated as 64 hexadecimal characters before any request.",
      "The value of one pool share in each reserve asset is derived and shown."
    ],
    codes: [
      ["empty_input", "no pool ID submitted"],
      ["invalid_pool_id", "not 64 hexadecimal characters"],
      ["pool_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "Price is a ratio of two 7-decimal amounts. Compute it in `BigInt` with an explicit scale rather than dividing floats, and state the precision you kept.",
    outOfScope: [
      "Do not deposit into or withdraw from a pool.",
      "Do not estimate slippage for a trade — that belongs to the path payment tool."
    ]
  },
  {
    slug: "claimable-balances",
    title: "Claimable Balance Explorer",
    category: "assets",
    difficulty: "advanced",
    summary:
      "List claimable balances for an account or look one up by ID, and translate each claimant's predicate into a plain-language statement of who can claim it and when.",
    why:
      "Claimable balance predicates are a recursive structure of `and`, `or`, `not`, absolute and relative time bounds. Raw JSON makes them effectively unreadable.",
    source:
      "Horizon `GET /claimable_balances?claimant={account}` and `GET /claimable_balances/{id}`.",
    criteria: [
      "Every claimable balance shows its asset, amount, sponsor and ID.",
      "Each claimant's predicate is rendered as readable text, including nested `and` / `or` / `not` combinations.",
      "Absolute time bounds are shown as dates, and relative ones as durations from the balance's creation.",
      "Each claimant is marked as claimable now or not, evaluated against the current time.",
      "An unconditional predicate is stated as 'can be claimed at any time' rather than shown as an empty object."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_input", "neither a valid account address nor a valid balance ID"],
      ["balance_not_found", "Horizon 404 for the given ID"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "The predicate renderer is the whole tool. Write it as a pure recursive function over the predicate type with its own unit tests covering nesting at least three levels deep — that function is where the value is, not in the fetch.",
    outOfScope: [
      "Do not claim a balance.",
      "Do not create claimable balances."
    ]
  },
  {
    slug: "asset-flags-inspector",
    title: "Issuer Authorization Flags Inspector",
    category: "assets",
    difficulty: "medium",
    summary:
      "Show an issuing account's authorization flags and explain, in plain language, what each one lets the issuer do to holders of its assets.",
    why:
      "`auth_revocable` and `auth_clawback_enabled` are the difference between an asset you control and an asset the issuer controls. Most holders never see them.",
    source: "Horizon `GET /accounts/{issuer}` — the `flags` object.",
    criteria: [
      "All four flags are shown with their state and a one-sentence consequence for a holder.",
      "`auth_immutable` is highlighted as the flag that makes the others permanent.",
      "The combination of `auth_required` and `auth_revocable` is called out as full issuer control over holders.",
      "An account with no flags set is described as an ordinary account that happens to issue nothing special.",
      "The tool states that flags apply to assets the account issues, not to assets it holds."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "The value here is the wording, not the fetch. Each flag needs a consequence a holder actually cares about — 'the issuer can take this asset back from your account' beats 'clawback enabled'.",
    outOfScope: [
      "Do not set or clear flags.",
      "Do not list the assets the account issues — that is the asset statistics tool."
    ]
  },

  // ---------------------------------------------------------------- payments
  {
    slug: "payment-uri-parser",
    title: "SEP-0007 Payment URI Parser",
    category: "payments",
    difficulty: "medium",
    summary:
      "Paste a `web+stellar:` URI and see every parameter decoded, validated and explained, for both the `pay` and `tx` operations.",
    why:
      "RevyHubX can already build these URIs. Reading one that arrived from somewhere else — and spotting what is wrong with it — is the other half.",
    source: "Local only. The URI is parsed in the browser; nothing is fetched.",
    offline: true,
    criteria: [
      "Both `web+stellar:pay` and `web+stellar:tx` are recognised, and an unknown operation is named as unsupported rather than rejected as malformed.",
      "Every parameter is listed with its decoded value and whether it is valid: destination checksum, amount precision, memo type, asset code and issuer.",
      "Parameters that SEP-0007 defines but the URI omits are listed as absent, so the reader can see what a wallet will not be told.",
      "Unknown parameters are surfaced rather than silently dropped.",
      "The signature parameters (`signature`, `origin_domain`) are reported as present or absent, with an explicit statement that this tool does not verify them."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["wrong_scheme", "not a web+stellar URI"],
      ["unsupported_operation", "a web+stellar URI with an operation other than pay or tx"],
      ["malformed_uri", "the query string cannot be parsed"],
      ["invalid_parameters", "the URI parses but required parameters are missing or invalid"]
    ],
    reference: "features/payment-qr",
    notes:
      "Never claim a URI is safe. This tool reports what a URI *says*; whether the origin domain actually signed it is a different problem, and the UI must say so rather than implying trust.",
    outOfScope: [
      "Do not verify SEP-0007 signatures.",
      "Do not execute, submit or hand off the payment to a wallet."
    ]
  },
  {
    slug: "path-payment-finder",
    title: "Path Payment Route Finder",
    category: "payments",
    difficulty: "advanced",
    summary:
      "Find the routes Stellar's decentralised exchange offers between two assets, for both strict-send and strict-receive, and show the hops and effective rate for each.",
    why:
      "Path payments are how Stellar does cross-asset transfers. Whether a viable route exists — and what it costs — is invisible without querying for it.",
    source:
      "Horizon `GET /paths/strict-send` and `GET /paths/strict-receive`.",
    criteria: [
      "Strict-send and strict-receive are both supported and clearly distinguished in the UI.",
      "Each returned path shows every hop in order, with the native asset labelled as XLM.",
      "The effective rate and the implied cost of each route are computed and shown.",
      "'No path found' is a first-class result with an explanation of what that means, not an error state.",
      "Source and destination asset inputs each accept native or issued assets, with issuer validation."
    ],
    codes: [
      ["empty_source_asset", "no source asset submitted"],
      ["invalid_source_asset", "source asset code or issuer is invalid"],
      ["empty_destination_asset", "no destination asset submitted"],
      ["invalid_destination_asset", "destination asset code or issuer is invalid"],
      ["empty_amount", "no amount submitted"],
      ["invalid_amount", "not a positive number within 7 decimal places"],
      ["no_path_found", "Horizon returned an empty path set"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "This form has the most inputs of any tool in the catalogue — two full asset selectors plus an amount. Field-level error reporting is not optional; a single banner would make it unusable.",
    outOfScope: [
      "Do not build or submit a path payment.",
      "Do not poll for live rate updates."
    ]
  },
  {
    slug: "payment-history",
    title: "Account Payment History",
    category: "payments",
    difficulty: "medium",
    summary:
      "Browse the payments in and out of an account, with direction, counterparty, asset and amount, and cursor-based paging.",
    why:
      "'What happened to this account' is the first question in any debugging session, and the payments endpoint answers it more directly than the full operation feed.",
    source: "Horizon `GET /accounts/{account_id}/payments?order=desc&limit=20`.",
    criteria: [
      "Each payment shows direction relative to the queried account, counterparty, asset and amount.",
      "`create_account` records are handled alongside `payment` and both path payment types, each labelled with what it actually was.",
      "Paging uses Horizon cursors, and the control is disabled rather than hidden when there is no further page.",
      "An account with no payments is a clear empty result, distinct from an account that does not exist.",
      "Each row links to the transaction hash it came from, copyable."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "The `/payments` endpoint mixes four record types with different field names for the same idea. Normalise them into one row type before rendering — the same job `normalizeBalance` does for balances.",
    outOfScope: [
      "Do not implement infinite scroll — explicit paging only.",
      "Do not export to CSV."
    ]
  },
  {
    slug: "amount-converter",
    title: "Stroop and Amount Converter",
    category: "payments",
    difficulty: "medium",
    summary:
      "Convert between stroops and display amounts in both directions, with exact integer arithmetic and clear reporting of precision loss.",
    why:
      "Stellar stores amounts as int64 stroops but displays them with 7 decimals. Getting that conversion wrong by one place is a class of bug that reaches production.",
    source: "Local only. Pure arithmetic, no requests.",
    offline: true,
    criteria: [
      "Conversion works in both directions and is exact for every value up to the int64 maximum.",
      "An amount with more than 7 decimal places is rejected with an explanation, never silently rounded.",
      "A value exceeding the int64 range is rejected with the limit stated.",
      "The int64 maximum is offered as a one-click example, because it is the value most likely to break a naive implementation.",
      "Both fields update from either direction without an update loop."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_amount", "not a well-formed decimal number"],
      ["too_many_decimals", "more than 7 decimal places"],
      ["out_of_range", "outside the int64 stroop range"],
      ["negative_not_allowed", "a negative value was entered"]
    ],
    reference: "features/payment-qr",
    notes:
      "`Number` must not appear anywhere in this slice. The tool exists precisely because floating point gets this wrong, so a float in the implementation would be the bug it is meant to prevent.",
    outOfScope: [
      "Do not convert between assets or fetch prices.",
      "Do not add fiat currency conversion."
    ]
  },
  {
    slug: "batch-address-validator",
    title: "Bulk Address Validator",
    category: "payments",
    difficulty: "medium",
    summary:
      "Validate a whole list of Stellar addresses at once — pasted or line-separated — and report per-line results with a summary of what failed and why.",
    why:
      "Airdrops and payouts start from a list of addresses. Finding the three bad rows in four hundred lines is not a job for one-at-a-time validation.",
    source: "Local only. Every check runs in the browser.",
    offline: true,
    criteria: [
      "Newline, comma and whitespace separated input all work, and the separator does not have to be declared.",
      "Each line gets its own result with a specific reason for failure, matching the address validator's codes.",
      "Duplicate addresses are detected and reported with the line numbers they appear on.",
      "A summary states how many are valid, invalid and duplicated.",
      "Any line that looks like a secret key is reported as such and the value is not rendered back — not even truncated."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["no_valid_lines", "input parsed but contained no candidate addresses"],
      ["too_many_lines", "input exceeds the documented row limit"]
    ],
    reference: "features/address-validator",
    notes:
      "A pasted payout list is exactly the place a secret key ends up by accident. Detect `S` rows, count them, refuse to display them, and say clearly that the key should be considered compromised.",
    outOfScope: [
      "Do not upload files — paste only.",
      "Do not look any address up on Horizon."
    ]
  },

  // ------------------------------------------------------------ transactions
  {
    slug: "xdr-decoder",
    title: "Transaction XDR Decoder",
    category: "transactions",
    difficulty: "advanced",
    summary:
      "Decode a base64 transaction envelope entirely in the browser and show source account, fee, sequence, preconditions, memo, signatures and every operation with its parameters.",
    why:
      "XDR is what wallets and tools actually exchange. Being able to read one without submitting it anywhere is the single most useful debugging step in Stellar.",
    source: "Local only. `TransactionBuilder.fromXDR` from the SDK; nothing is transmitted.",
    offline: true,
    criteria: [
      "Both `TransactionEnvelope` and `FeeBumpTransactionEnvelope` are handled, and a fee bump shows the inner transaction as well.",
      "Every operation is listed with its type and its own parameters, not just its name.",
      "Preconditions — time bounds, ledger bounds, min sequence — are shown when present.",
      "Signatures are listed by hint with a count; the tool states that it does not verify them.",
      "A network passphrase selector is present, and the tool explains that the same XDR hashes differently per network."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_base64", "the input is not valid base64"],
      ["invalid_xdr", "valid base64 that is not a transaction envelope"],
      ["unsupported_envelope", "an envelope type this tool does not decode"]
    ],
    reference: "features/payment-qr",
    notes:
      "An XDR envelope is untrusted input from a stranger. Decoding must never throw into the UI, and the tool must never offer to sign or submit — that is exactly the social-engineering path this tool should refuse to be part of.",
    outOfScope: [
      "Do not sign, submit or simulate the transaction.",
      "Do not build XDR — decoding only."
    ]
  },
  {
    slug: "result-code-explainer",
    title: "Transaction Result Code Explainer",
    category: "transactions",
    difficulty: "medium",
    summary:
      "Explain Stellar transaction and operation result codes in plain language, either by pasting a code directly or by pasting a result XDR to decode first.",
    why:
      "`tx_failed` with `op_underfunded` tells an experienced developer everything and a newcomer nothing. This is the lookup table that gap needs.",
    source: "Local only. A curated code table plus local XDR decoding.",
    offline: true,
    criteria: [
      "Transaction-level codes (`tx_*`) and operation-level codes (`op_*`) are both covered and clearly separated.",
      "Each code has a cause and a concrete fix, not a restatement of its name.",
      "A pasted result XDR is decoded to the codes it contains, and each one is explained.",
      "Codes that share a name across operation types are disambiguated by operation.",
      "The table is searchable, and an unrecognised code says so rather than guessing."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["unknown_code", "the code is not in the table"],
      ["invalid_xdr", "the input looked like XDR but did not decode"]
    ],
    reference: "features/address-validator",
    notes:
      "The value of this tool is entirely in the writing. A row that says 'op_underfunded: the operation was underfunded' is worthless; it needs to say which balance was short and what to check.",
    outOfScope: [
      "Do not fetch a transaction from Horizon — that is the transaction lookup tool.",
      "Do not attempt to auto-fix a failed transaction."
    ]
  },
  {
    slug: "operation-browser",
    title: "Operation History Browser",
    category: "transactions",
    difficulty: "medium",
    summary:
      "Browse every operation on an account with type filtering and cursor paging, showing the parameters that matter for each operation type.",
    why:
      "Payments are only part of an account's history. Trustline changes, offers and option changes are where configuration bugs hide.",
    source: "Horizon `GET /accounts/{account_id}/operations?order=desc&limit=20`.",
    criteria: [
      "Every operation type Horizon returns is rendered without falling back to raw JSON.",
      "Operations can be filtered by type, and the filter states how many of the loaded rows it matched.",
      "Cursor paging works in both directions and disables at the ends.",
      "Failed operations are visually distinguished from successful ones.",
      "Each row shows the transaction hash it belongs to, copyable."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "There are more than twenty operation types and new ones arrive with protocol versions. Design the renderer so an unknown type degrades to a readable summary instead of breaking the page.",
    outOfScope: [
      "Do not show effects — that is the effects timeline tool.",
      "Do not implement infinite scroll."
    ]
  },
  {
    slug: "effects-timeline",
    title: "Effects Timeline Viewer",
    category: "transactions",
    difficulty: "advanced",
    summary:
      "Show the ledger effects an account experienced as a chronological timeline, grouped by the transaction that caused them.",
    why:
      "Effects are what actually changed on the ledger. An operation says what was requested; effects say what happened, including consequences the operation did not name.",
    source: "Horizon `GET /accounts/{account_id}/effects?order=desc&limit=20`.",
    criteria: [
      "Effects are grouped by transaction and ordered chronologically within each group.",
      "Each effect type renders its own relevant fields, with amounts and assets formatted consistently.",
      "Balance-changing effects are visually distinguished from configuration-changing ones.",
      "The timeline explains that one operation can produce several effects, and shows an example of that in the grouping.",
      "Cursor paging works and disables at the ends."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "Grouping across a cursor page boundary is the hard part: the first group on page two is usually a continuation of the last group on page one. Decide how you handle that and document the decision in the README.",
    outOfScope: [
      "Do not merge effects across accounts.",
      "Do not chart balance over time."
    ]
  },
  {
    slug: "memo-inspector",
    title: "Memo Encoder and Decoder",
    category: "transactions",
    difficulty: "medium",
    summary:
      "Build and inspect all five Stellar memo types, showing the byte-level encoding and enforcing each type's real limits.",
    why:
      "Memos are how exchanges route deposits, and the wrong memo type or an over-length text memo is a common way to lose a deposit.",
    source: "Local only. Encoding and decoding happen in the browser.",
    offline: true,
    criteria: [
      "All five types are supported: none, text, id, hash, return.",
      "Text memos are limited by **bytes**, not characters, and the byte count is shown live as the user types.",
      "Id memos are validated as unsigned 64-bit integers using `BigInt`.",
      "Hash and return memos are validated as 32 bytes and accept both hex and base64 input.",
      "The encoded form is shown alongside the input for every type, and both are copyable."
    ],
    codes: [
      ["empty_input", "nothing submitted for a type that requires a value"],
      ["text_too_long", "the text memo exceeds 28 bytes"],
      ["invalid_id", "not an unsigned 64-bit integer"],
      ["invalid_hash", "not 32 bytes of valid hex or base64"],
      ["unsupported_type", "an unrecognised memo type was selected"]
    ],
    reference: "features/payment-qr",
    notes:
      "The 28-byte text limit counts bytes: ten rocket emoji are ten characters and forty bytes. `features/payment-qr` already has a test for exactly this case — the live byte counter is the new part.",
    outOfScope: [
      "Do not attach the memo to a transaction.",
      "Do not look up which exchange requires which memo type."
    ]
  },
  {
    slug: "preconditions-explainer",
    title: "Transaction Preconditions Explainer",
    category: "transactions",
    difficulty: "advanced",
    summary:
      "Explain a transaction's preconditions — time bounds, ledger bounds, minimum sequence age and number, extra signers — and evaluate whether they are currently satisfiable.",
    why:
      "Preconditions are why a transaction that looks correct is rejected. Reading them from XDR and reasoning about them by hand is slow and error-prone.",
    source:
      "Local decoding of a pasted XDR, plus Horizon `GET /ledgers?order=desc&limit=1` for the current ledger and close time.",
    criteria: [
      "Time bounds are shown as absolute dates and as durations relative to now, with expired bounds called out.",
      "Ledger bounds are compared against the current ledger sequence.",
      "Minimum sequence age and minimum sequence ledger gap are explained in terms of what they gate.",
      "Extra signers are listed.",
      "A transaction with no preconditions is described as valid indefinitely, and what that implies is stated."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_xdr", "the input did not decode to a transaction envelope"],
      ["no_preconditions", "the transaction declares none"],
      ["ledger_unavailable", "the current ledger could not be fetched"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "Evaluation depends on the current ledger, so the answer is a snapshot. Say when it was taken, and make the ledger fetch failing a degraded state that still shows the decoded bounds rather than an error page.",
    outOfScope: [
      "Do not sign or submit the transaction.",
      "Do not build preconditions."
    ]
  },

  // --------------------------------------------------------------- soroban
  {
    slug: "contract-inspector",
    title: "Soroban Contract ID Inspector",
    category: "soroban",
    difficulty: "medium",
    summary:
      "Validate a Soroban contract ID, show its raw hash, convert between StrKey and hex forms, and generate explorer links for the selected network.",
    why:
      "Contract IDs appear as `C…` StrKey in some tools and as hex in others, and confirming that two representations are the same contract is a routine, tedious task.",
    source: "Local only. StrKey encoding and decoding in the browser.",
    offline: true,
    criteria: [
      "A `C…` contract address and a 64-character hex hash are both accepted, and each is converted to the other.",
      "A checksum failure is distinguished from a wrong-prefix value, matching the address validator's error model.",
      "Explorer links are generated for the selected network and clearly labelled with which network they point at.",
      "An address of a different StrKey kind is named rather than rejected as unparseable.",
      "Both representations are copyable."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["unknown_format", "neither a StrKey value nor 64 hex characters"],
      ["wrong_strkey_kind", "a valid StrKey value that is not a contract"],
      ["bad_checksum", "the C prefix is right but the checksum fails"]
    ],
    reference: "features/address-validator",
    notes:
      "`StrKey.encodeContract` and `decodeContract` are the whole conversion. The care goes into the error model — read `features/address-validator/lib/addressValidator.ts` for how prefix detection and checksum validation are kept separate.",
    outOfScope: [
      "Do not call the contract or fetch its state.",
      "Do not decode the contract's WASM."
    ]
  },
  {
    slug: "rpc-health",
    title: "Soroban RPC Health Check",
    category: "soroban",
    difficulty: "medium",
    summary:
      "Query the Soroban RPC endpoint for its health, version and latest ledger, and report how far behind the ledger is in wall-clock terms.",
    why:
      "A stale or unhealthy RPC endpoint produces confusing failures elsewhere. Checking it directly turns a mystery into a one-line answer.",
    source: "Soroban RPC `getHealth`, `getVersionInfo` and `getLatestLedger`.",
    criteria: [
      "Health status, RPC version, protocol version and latest ledger are all displayed.",
      "The ledger's age in seconds is computed and an endpoint that is falling behind is flagged.",
      "The retention window (`oldestLedger` to `latestLedger`) is shown, with an explanation of what falls outside it.",
      "All three calls are issued concurrently and a failure in one does not blank the others.",
      "The endpoint URL in use is displayed, so it is obvious which network is being checked."
    ],
    codes: [
      ["endpoint_unreachable", "the RPC endpoint did not respond"],
      ["rpc_error", "the endpoint returned a JSON-RPC error object"],
      ["unhealthy", "the endpoint responded but reports itself unhealthy"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/testnet-faucet",
    notes:
      "Use `sorobanRpc` from `@/core/rpc/client`. A JSON-RPC error arrives with HTTP 200 and an `error` member — checking `response.ok` alone will report a failure as a success.",
    outOfScope: [
      "Do not poll continuously — an explicit refresh only.",
      "Do not compare multiple endpoints."
    ]
  },
  {
    slug: "contract-events",
    title: "Soroban Contract Event Viewer",
    category: "soroban",
    difficulty: "advanced",
    summary:
      "Fetch and decode the events a Soroban contract emitted over a ledger range, showing topics and values in readable form.",
    why:
      "Events are how a Soroban contract reports what it did. They arrive as base64 ScVal and are unreadable without decoding.",
    source: "Soroban RPC `getEvents`.",
    criteria: [
      "Events are fetched for a contract ID over a ledger range, with the range validated against the endpoint's retention window.",
      "Topics and values are decoded from ScVal into readable form.",
      "Contract, system and diagnostic event types are distinguished.",
      "An empty result within a valid range is a clear 'no events' outcome, not an error.",
      "A range outside the retention window is reported with the actual available range."
    ],
    codes: [
      ["empty_contract_id", "no contract ID submitted"],
      ["invalid_contract_id", "not a valid C… address"],
      ["invalid_ledger_range", "start ledger is missing, negative or after the end"],
      ["range_outside_retention", "the requested range is no longer retained"],
      ["no_events", "the range is valid but contains no matching events"],
      ["rpc_error", "the endpoint returned a JSON-RPC error object"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "ScVal decoding is recursive — maps and vectors nest arbitrarily. Write the decoder as a pure function with its own tests before wiring any UI to it.",
    outOfScope: [
      "Do not stream or poll for new events.",
      "Do not decode against a contract's declared spec."
    ]
  },
  {
    slug: "contract-storage",
    title: "Contract Storage and TTL Inspector",
    category: "soroban",
    difficulty: "advanced",
    summary:
      "Read a contract's ledger entries, show its instance and persistent storage, and report the TTL of each entry with how long until it expires.",
    why:
      "Soroban state expires. A contract that stops working for no visible reason has usually had an entry archived, and TTL is the only place that shows up.",
    source: "Soroban RPC `getLedgerEntries` plus `getLatestLedger` for the TTL baseline.",
    criteria: [
      "Instance storage and persistent storage entries are shown separately.",
      "Each entry shows its live-until ledger, the ledgers remaining, and an approximate wall-clock time.",
      "An entry that has already expired is clearly marked as archived.",
      "The difference between temporary, persistent and instance storage is explained where it affects what the reader sees.",
      "A contract with no readable entries is a specific outcome, distinct from an invalid contract ID."
    ],
    codes: [
      ["empty_contract_id", "no contract ID submitted"],
      ["invalid_contract_id", "not a valid C… address"],
      ["contract_not_found", "the RPC endpoint has no entries for this contract"],
      ["rpc_error", "the endpoint returned a JSON-RPC error object"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "Converting ledgers-remaining into wall-clock time depends on an assumed close time. State the assumption in the UI rather than presenting an estimate as a fact.",
    outOfScope: [
      "Do not extend a TTL or restore an archived entry.",
      "Do not invoke the contract."
    ]
  },
  {
    slug: "scval-codec",
    title: "ScVal Encoder and Decoder",
    category: "soroban",
    difficulty: "advanced",
    summary:
      "Convert between base64 ScVal and readable JSON in both directions, covering the full type set including nested maps, vectors and the large integer types.",
    why:
      "Every Soroban value crossing a boundary is an ScVal. Reading and constructing them by hand is the most common friction in Soroban development.",
    source: "Local only. `xdr.ScVal` from the SDK; nothing is transmitted.",
    offline: true,
    criteria: [
      "Decoding covers the full ScVal type set: void, bool, all integer widths, bytes, string, symbol, vec, map, address, and the u128/i128/u256/i256 types.",
      "Encoding from JSON back to base64 works and round-trips exactly for every supported type.",
      "Large integer types are handled with `BigInt` and never lose precision.",
      "Nested structures render with their nesting visible, not flattened.",
      "An unsupported or malformed value names the specific type that failed rather than failing the whole document."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_base64", "the input is not valid base64"],
      ["invalid_scval", "valid base64 that is not an ScVal"],
      ["invalid_json", "the JSON side is not parseable"],
      ["unsupported_type", "a type this codec does not handle"]
    ],
    reference: "features/payment-qr",
    notes:
      "u128 and above cannot survive a round trip through `Number`, and `JSON.parse` will silently mangle them. Keep them as strings at the JSON boundary and convert with `BigInt`.",
    outOfScope: [
      "Do not invoke contracts.",
      "Do not decode against a contract spec — raw ScVal only."
    ]
  },
  {
    slug: "simulation-explainer",
    title: "Soroban Simulation Result Explainer",
    category: "soroban",
    difficulty: "advanced",
    summary:
      "Simulate a Soroban transaction envelope against RPC and explain the result: resource usage, fees, state changes, auth requirements, or why it failed.",
    why:
      "Simulation is how Soroban tells you a transaction will fail before you pay for it. Its response is a dense structure that most people never read.",
    source: "Soroban RPC `simulateTransaction`.",
    criteria: [
      "A pasted transaction envelope is simulated and the outcome is reported as success, error or restore-required.",
      "Resource usage — instructions, read and write bytes, ledger entries — is shown against the network limits.",
      "The minimum resource fee is shown and explained separately from the base fee.",
      "Required authorization entries are listed.",
      "A simulation error surfaces the contract's own error message rather than a generic failure."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_xdr", "the input did not decode to a transaction envelope"],
      ["simulation_failed", "the endpoint simulated the transaction and it failed"],
      ["restore_required", "the simulation reports archived state that must be restored first"],
      ["rpc_error", "the endpoint returned a JSON-RPC error object"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "A failed simulation is a *successful* request with a useful answer — the same distinction `transaction-lookup` draws for a failed transaction. Modelling it as an error would throw away the only information the user came for.",
    outOfScope: [
      "Do not submit the transaction after simulating it.",
      "Do not build transactions — simulation of pasted XDR only."
    ]
  },

  // ---------------------------------------------------------------- network
  {
    slug: "horizon-health",
    title: "Horizon Endpoint Health Diagnostic",
    category: "network",
    difficulty: "medium",
    summary:
      "Check the configured Horizon endpoint's version, ingestion lag, history range and rate-limit headroom, and say plainly whether it is usable right now.",
    why:
      "Horizon lagging behind the network is invisible until queries return stale data. Checking it directly is faster than guessing.",
    source: "Horizon `GET /` (the root resource) and its rate-limit response headers.",
    criteria: [
      "Core latest ledger and Horizon's ingested latest ledger are both shown, with the gap between them.",
      "An ingestion lag beyond a documented threshold is flagged as degraded.",
      "The available history range (`history_elder_ledger` to `history_latest_ledger`) is shown.",
      "Rate-limit headers are surfaced when present and reported as absent when not.",
      "Horizon and Stellar Core versions are displayed."
    ],
    codes: [
      ["endpoint_unreachable", "the endpoint did not respond"],
      ["unexpected_response", "the response was not a Horizon root document"],
      ["degraded", "the endpoint responded but is lagging beyond the threshold"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/testnet-faucet",
    notes:
      "`degraded` is a successful request with a concerning answer. Show all the data *and* the warning — collapsing it into an error hides the numbers that explain it.",
    outOfScope: [
      "Do not test arbitrary user-supplied endpoints.",
      "Do not poll continuously."
    ]
  },
  {
    slug: "fee-statistics",
    title: "Network Fee Statistics",
    category: "network",
    difficulty: "medium",
    summary:
      "Show current network fee statistics — the fee distribution across recent ledgers and ledger capacity usage — and turn them into a concrete fee recommendation.",
    why:
      "Underpaying the fee gets a transaction dropped in a busy ledger. The percentile data that answers 'what should I pay' is published but rarely read.",
    source: "Horizon `GET /fee_stats`.",
    criteria: [
      "The full fee-charged percentile distribution is displayed, not just the minimum.",
      "Ledger capacity usage is shown as a percentage with an explanation of what surge pricing means.",
      "A concrete recommended fee is derived from the percentiles and the reasoning is stated.",
      "Both `fee_charged` and `max_fee` distributions are shown and the difference between them is explained.",
      "All fees are shown in stroops and in XLM."
    ],
    codes: [
      ["endpoint_unreachable", "the endpoint did not respond"],
      ["unexpected_response", "the response was not a fee-stats document"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "The distinction between `fee_charged` (what was actually paid) and `max_fee` (what was offered) is the point of the tool. A version that shows only one of them answers the wrong question.",
    outOfScope: [
      "Do not chart fees over time.",
      "Do not submit transactions at the recommended fee."
    ]
  },
  {
    slug: "ledger-lookup",
    title: "Ledger Lookup",
    category: "network",
    difficulty: "medium",
    summary:
      "Look up a ledger by sequence number and show its close time, transaction and operation counts, fee pool, total coins and protocol version.",
    why:
      "Ledger sequence numbers appear throughout Horizon responses with nothing to resolve them against — including the timestamp everything else is anchored to.",
    source: "Horizon `GET /ledgers/{sequence}`.",
    criteria: [
      "Close time is shown both as an absolute timestamp and as an age relative to now.",
      "Successful and failed transaction counts are shown separately.",
      "Fee pool, total coins and base fee/reserve for that ledger are displayed.",
      "The protocol version in effect at that ledger is shown.",
      "A sequence number beyond the current ledger is rejected with the current height stated, rather than passed through as a 404."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_sequence", "not a positive integer"],
      ["ledger_not_found", "Horizon 404 — outside the retained history range"],
      ["future_ledger", "the sequence is higher than the current ledger"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "Distinguishing 'this ledger has not happened yet' from 'this ledger is no longer retained' requires knowing the current height. Both are 404s from Horizon and they need completely different advice.",
    outOfScope: [
      "Do not list the transactions in the ledger.",
      "Do not paginate through ledgers."
    ]
  },
  {
    slug: "network-comparison",
    title: "Testnet and Mainnet Comparison",
    category: "network",
    difficulty: "medium",
    summary:
      "Show testnet and mainnet side by side — latest ledger, protocol version, base fee, base reserve and ingestion state — so differences are obvious at a glance.",
    why:
      "Testnet often runs a protocol version ahead of mainnet. Discovering that from a failing transaction is the slow way to find out.",
    source: "Horizon `GET /` on both networks concurrently.",
    criteria: [
      "Both networks are queried concurrently and rendered side by side.",
      "Protocol version differences are highlighted rather than merely displayed.",
      "One network being unreachable does not blank the other; that column reports its own failure.",
      "Testnet's periodic reset is explained, along with what it means for data that was there yesterday.",
      "The header network switch does not change what this tool shows, and the UI says so."
    ],
    codes: [
      ["both_unreachable", "neither endpoint responded"],
      ["partial_failure", "one of the two endpoints failed"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "This is the one tool that deliberately ignores the network switch, because comparing both networks is its whole purpose. Say that in the UI so it does not read as a bug.",
    outOfScope: [
      "Do not compare arbitrary custom networks.",
      "Do not add futurenet."
    ]
  },
  {
    slug: "orderbook-viewer",
    title: "Order Book Viewer",
    category: "network",
    difficulty: "advanced",
    summary:
      "Show the bids and asks for an asset pair on Stellar's decentralised exchange, with cumulative depth and the current spread.",
    why:
      "The DEX order book determines whether a path payment will actually fill. It is public data with no readable view in most developer tooling.",
    source: "Horizon `GET /order_book` with selling and buying asset parameters.",
    criteria: [
      "Bids and asks are shown separately, each ordered by price with cumulative depth.",
      "The spread is computed and shown in both absolute and percentage terms.",
      "Both sides accept native and issued assets, with issuer validation for issued ones.",
      "An empty order book is a clear result stating there is no liquidity for this pair, not an error.",
      "Prices use Horizon's exact numerator/denominator rather than the rounded decimal."
    ],
    codes: [
      ["empty_selling_asset", "no selling asset submitted"],
      ["invalid_selling_asset", "selling asset code or issuer is invalid"],
      ["empty_buying_asset", "no buying asset submitted"],
      ["invalid_buying_asset", "buying asset code or issuer is invalid"],
      ["same_asset", "both sides name the same asset"],
      ["empty_orderbook", "the pair has no offers on either side"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "Horizon gives each price as both a decimal string and an exact `price_r` fraction. The decimal is rounded; use the fraction for anything you compute and say which one you displayed.",
    outOfScope: [
      "Do not place or cancel offers.",
      "Do not stream live updates."
    ]
  },

  // ------------------------------------------------------------------- keys
  {
    slug: "strkey-inspector",
    title: "StrKey Type Inspector",
    category: "keys",
    difficulty: "medium",
    summary:
      "Identify any Stellar StrKey value by its version byte, report what kind of identifier it is, and show its raw bytes — while refusing to display secret seeds.",
    why:
      "Stellar encodes at least seven different things as StrKey. Knowing which one you are holding is often the first step in debugging.",
    source: "Local only. StrKey decoding in the browser.",
    offline: true,
    criteria: [
      "Every public StrKey version byte is recognised: G, M, C, T, X, P, and S is detected but refused.",
      "The decoded raw bytes are shown as hex, with the byte length, for every kind except secret seeds.",
      "A checksum failure is reported separately from an unrecognised prefix.",
      "Muxed addresses additionally show the underlying G address and the multiplexing ID.",
      "A secret seed is refused on prefix alone, never decoded, and never rendered — not even partially."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["secret_seed_rejected", "an S… value was submitted and discarded"],
      ["unknown_prefix", "the first character is not a Stellar version byte"],
      ["bad_checksum", "the prefix is valid but the checksum fails"]
    ],
    reference: "features/address-validator",
    notes:
      "This overlaps the address validator deliberately, and stays a separate tool because it answers a different question: the validator asks 'is this a usable account address', this asks 'what is this'. Do not modify the address validator.",
    outOfScope: [
      "Do not look anything up on Horizon.",
      "Do not decode or display secret seeds under any circumstance."
    ]
  },
  {
    slug: "muxed-account-codec",
    title: "Muxed Account Encoder and Decoder",
    category: "keys",
    difficulty: "medium",
    summary:
      "Convert between an M-address and its underlying G-address plus multiplexing ID, in both directions.",
    why:
      "Muxed accounts let one Stellar account serve many users, and exchanges use them heavily — but almost nothing shows what is inside one.",
    source: "Local only. SEP-0023 encoding and decoding in the browser.",
    offline: true,
    criteria: [
      "Decoding an M-address yields its G-address and its multiplexing ID.",
      "Encoding from a G-address and an ID yields the correct M-address.",
      "The ID is handled as an unsigned 64-bit value with `BigInt`, and the full range is accepted.",
      "Round-tripping any valid pair returns exactly the original M-address, asserted by a test.",
      "The relationship between an M-address and its G-address — same ledger account, different routing — is explained."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_muxed_address", "not a valid M… address"],
      ["invalid_base_address", "the G-address fails the StrKey checksum"],
      ["invalid_id", "the multiplexing ID is not an unsigned 64-bit integer"]
    ],
    reference: "features/address-validator",
    notes:
      "Multiplexing IDs routinely exceed `Number.MAX_SAFE_INTEGER` — exchanges use large IDs. `Number` anywhere in this slice produces a silently wrong address.",
    outOfScope: [
      "Do not look up the underlying account on Horizon.",
      "Do not send payments to a muxed address."
    ]
  },
  {
    slug: "keypair-generator",
    title: "Testnet Keypair Generator",
    category: "keys",
    difficulty: "medium",
    summary:
      "Generate a Stellar keypair in the browser for testnet development, with unmistakable warnings about what the secret key is and where it must never go.",
    why:
      "Every Stellar tutorial starts with a keypair. Generating one safely — and understanding what you are holding — is a genuine beginner obstacle.",
    source: "Local only. `Keypair.random()` using the browser's CSPRNG.",
    offline: true,
    criteria: [
      "The keypair is generated in the browser and never transmitted anywhere.",
      "The secret key is hidden by default behind an explicit reveal action.",
      "A prominent, persistent warning states that this key is for testnet development only and must never hold real value.",
      "Nothing is written to `localStorage`, `sessionStorage`, the URL or any log.",
      "The tool explains that closing the page loses the key permanently, before the user can close it."
    ],
    codes: [
      ["generation_unavailable", "the browser exposes no secure random source"]
    ],
    reference: "features/payment-qr",
    notes:
      "This is the only tool in RevyHubX that ever produces a secret key, so the safety rules are stricter, not looser. Add a test asserting the secret never reaches any storage API, and one asserting it is not in the DOM before the reveal.",
    outOfScope: [
      "Do not fund the account — link to the Testnet Faucet tool instead.",
      "Do not offer mnemonic or BIP-39 derivation.",
      "Do not offer to 'save' or 'back up' the key anywhere."
    ]
  },
  {
    slug: "signature-verifier",
    title: "Ed25519 Signature Verifier",
    category: "keys",
    difficulty: "advanced",
    summary:
      "Verify that a signature over a message was produced by the holder of a given Stellar public key, entirely in the browser.",
    why:
      "SEP-10 authentication and off-chain proof-of-ownership both rest on this check, and there is no simple place to perform it.",
    source: "Local only. `Keypair.fromPublicKey().verify()`; nothing is transmitted.",
    offline: true,
    criteria: [
      "The message is accepted as UTF-8 text, hex or base64, with the encoding chosen explicitly rather than guessed.",
      "The signature is accepted as hex or base64 and validated as 64 bytes.",
      "The result is unambiguous: verified, or not verified, with no third ambiguous state.",
      "A malformed input is reported as malformed and never as 'not verified' — the two mean very different things.",
      "The tool states that verification proves possession of the secret key at signing time, and nothing more."
    ],
    codes: [
      ["empty_public_key", "no public key submitted"],
      ["invalid_public_key", "fails the StrKey checksum"],
      ["empty_message", "no message submitted"],
      ["empty_signature", "no signature submitted"],
      ["invalid_signature_format", "the signature is not 64 bytes of valid hex or base64"],
      ["invalid_message_encoding", "the message does not decode under the selected encoding"]
    ],
    reference: "features/trustline-checker",
    notes:
      "Never conflate 'malformed input' with 'signature invalid'. Reporting a bad paste as a failed verification is how someone concludes a legitimate signature is a forgery.",
    outOfScope: [
      "Do not sign anything — verification only.",
      "Do not accept a secret key under any circumstance."
    ]
  },
  {
    slug: "hash-calculator",
    title: "Stellar Hash Calculator",
    category: "keys",
    difficulty: "medium",
    summary:
      "Compute SHA-256 hashes of arbitrary input and derive a transaction hash from an XDR envelope and network passphrase.",
    why:
      "A transaction's hash depends on its network passphrase, which is why the same XDR has different hashes on testnet and mainnet — a routine source of confusion.",
    source: "Local only. Web Crypto and SDK hashing; nothing is transmitted.",
    offline: true,
    criteria: [
      "SHA-256 is computed over UTF-8 text, hex or base64 input, with the encoding chosen explicitly.",
      "A transaction hash is derived from a pasted envelope plus a selected network passphrase.",
      "Switching the passphrase changes the derived hash, and the UI makes that cause and effect visible.",
      "A custom network passphrase can be entered alongside the two standard ones.",
      "Output is available as hex and base64, both copyable."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_encoding", "the input does not decode under the selected encoding"],
      ["invalid_xdr", "the envelope did not decode"],
      ["empty_passphrase", "no network passphrase selected or entered"],
      ["crypto_unavailable", "the browser exposes no Web Crypto digest"]
    ],
    reference: "features/payment-qr",
    notes:
      "Demonstrating that one envelope yields two different hashes under two passphrases is the teaching moment. Build the UI so that comparison is one click, not two separate runs.",
    outOfScope: [
      "Do not offer hash algorithms Stellar does not use.",
      "Do not sign or submit the transaction."
    ]
  },

  // -------------------------------------------------------------- standards
  {
    slug: "federation-resolver",
    title: "Federation Address Resolver",
    category: "standards",
    difficulty: "advanced",
    summary:
      "Resolve a `name*domain.com` federated address to a Stellar account through SEP-2, and resolve an account back to a federated name where the server supports it.",
    why:
      "Federated addresses are the human-readable layer of Stellar payments, and resolving one by hand means finding a toml, reading a field and calling an endpoint.",
    source:
      "`https://{domain}/.well-known/stellar.toml` for `FEDERATION_SERVER`, then that server's `?q=&type=name` endpoint.",
    criteria: [
      "Forward resolution (`name*domain.com` to an account) works, including the returned memo type and memo value.",
      "Reverse resolution (account to name) is attempted and reported as unsupported when the server does not offer it.",
      "The federation server URL is discovered from the toml, never guessed from the domain.",
      "A returned memo is displayed prominently, with a warning that omitting it can lose the payment.",
      "Only HTTPS federation servers are used, and a non-HTTPS server is refused."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_federated_address", "not in name*domain form"],
      ["toml_unreachable", "the domain's stellar.toml could not be fetched"],
      ["no_federation_server", "the toml declares no FEDERATION_SERVER"],
      ["insecure_server", "the declared server is not HTTPS"],
      ["name_not_found", "the federation server returned 404 for this name"],
      ["reverse_unsupported", "the server does not support reverse lookup"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "The federation server is a third-party endpoint named by a third-party toml. Treat every field it returns as untrusted text, follow no redirects to non-HTTPS, and never render its output as markup.",
    outOfScope: [
      "Do not send a payment to the resolved account.",
      "Do not cache resolutions across sessions."
    ]
  },
  {
    slug: "sep10-inspector",
    title: "SEP-10 Challenge Transaction Inspector",
    category: "standards",
    difficulty: "advanced",
    summary:
      "Decode a SEP-10 challenge transaction and check it against the specification's structural rules before anything signs it.",
    why:
      "A SEP-10 challenge is a transaction a stranger asks you to sign. Verifying it is a real transaction of the exact expected shape is the security step that makes the flow safe.",
    source: "Local only. XDR decoding and structural checks in the browser.",
    offline: true,
    criteria: [
      "The challenge is decoded and its structure checked: sequence number 0, exactly the expected manage-data operations, valid time bounds.",
      "The home domain and web auth domain operations are located and their values displayed.",
      "The server account that signed the challenge is shown, with a statement that this tool does not verify the signature against the toml.",
      "Every structural rule is reported individually as passing or failing, not collapsed into one verdict.",
      "A transaction with a non-zero sequence number is flagged prominently as not a valid challenge."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["invalid_xdr", "the input did not decode to a transaction envelope"],
      ["not_a_challenge", "the transaction does not have SEP-10 challenge structure"],
      ["expired_challenge", "the challenge's time bounds have passed"],
      ["malformed_challenge", "the structure is close but violates a specific rule"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "A sequence number of 0 is what makes a challenge unsubmittable, and therefore safe to sign. A challenge with a real sequence number is a transaction that could actually execute — that finding must be impossible to miss.",
    outOfScope: [
      "Do not sign the challenge.",
      "Do not perform the SEP-10 token exchange."
    ]
  },
  {
    slug: "anchor-discovery",
    title: "Anchor Endpoint Discovery",
    category: "standards",
    difficulty: "advanced",
    summary:
      "Read a domain's `stellar.toml` and report which SEP services it offers, with each declared endpoint and the assets it supports.",
    why:
      "Integrating with an anchor starts with finding out what it actually implements. That information is published in one file that nobody reads by hand.",
    source: "`https://{domain}/.well-known/stellar.toml`.",
    criteria: [
      "Declared endpoints for SEP-6, SEP-10, SEP-12, SEP-24, SEP-31 and SEP-38 are each reported as present or absent.",
      "The signing key and network passphrase are shown when declared.",
      "The `[[CURRENCIES]]` list is displayed with each asset's code and issuer.",
      "A domain with a valid toml that declares no services is a clear outcome, distinct from an unreachable domain.",
      "Only HTTPS is used, and the tool refuses a non-HTTPS domain rather than downgrading."
    ],
    codes: [
      ["empty_input", "no domain submitted"],
      ["invalid_domain", "not a well-formed domain name"],
      ["insecure_domain", "the domain is not reachable over HTTPS"],
      ["toml_unreachable", "the toml could not be fetched"],
      ["toml_invalid", "the response was not parseable TOML"],
      ["no_services", "the toml is valid but declares no SEP endpoints"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "Everything in the toml is written by the domain owner. Render every value as text, never follow a URL it declares, and never present a declared endpoint as verified — declaring SEP-24 support is not the same as implementing it.",
    outOfScope: [
      "Do not call the declared endpoints.",
      "Do not start a deposit or withdrawal flow."
    ]
  },
  {
    slug: "sep12-fields",
    title: "SEP-12 KYC Field Reference",
    category: "standards",
    difficulty: "medium",
    summary:
      "A searchable reference of the standard SEP-9 / SEP-12 KYC field names, their types, and which ones anchors commonly require.",
    why:
      "Anchors ask for KYC fields by exact standard names. Using a near-miss name is a silent integration failure that is hard to diagnose.",
    source: "Local only. A curated table of the SEP-9 field set.",
    offline: true,
    criteria: [
      "Natural-person, organization and financial-account field groups are all covered and clearly separated.",
      "Each field shows its exact name, type and description.",
      "Search matches on both field name and description.",
      "Fields that are binary uploads rather than string values are marked as such.",
      "The reference states explicitly that it contains no personal data and sends nothing anywhere."
    ],
    codes: [
      ["no_results", "the search matched no fields"]
    ],
    reference: "features/address-validator",
    notes:
      "This is a reference tool, so the standard four states shift: idle becomes the full table, and the empty state is 'your search matched nothing'. Keep the same structure and say so in the README.",
    outOfScope: [
      "Do not collect, store or transmit any personal data.",
      "Do not call a real SEP-12 endpoint."
    ]
  },
  {
    slug: "toml-validator",
    title: "stellar.toml Validator",
    category: "standards",
    difficulty: "advanced",
    summary:
      "Validate a domain's `stellar.toml` against SEP-1: required fields, correct types, well-formed currency entries, and the HTTPS and CORS requirements.",
    why:
      "A malformed toml breaks wallet discovery in ways that produce no error message anywhere. A checklist against the spec finds the problem in seconds.",
    source: "`https://{domain}/.well-known/stellar.toml`, or pasted toml content.",
    criteria: [
      "Both a domain fetch and a pasted toml are supported, and pasted content skips every network check.",
      "Each SEP-1 rule is reported individually as pass, fail or not applicable — never as one aggregate verdict.",
      "Currency entries are validated for asset code format and issuer checksum.",
      "Errors are separated from warnings, and each finding names the field it concerns.",
      "The `Access-Control-Allow-Origin` header is checked on a fetched toml and reported as missing when absent."
    ],
    codes: [
      ["empty_input", "neither a domain nor toml content was submitted"],
      ["invalid_domain", "not a well-formed domain name"],
      ["toml_unreachable", "the toml could not be fetched"],
      ["toml_invalid", "the content was not parseable TOML"],
      ["request_failed", "transport failure or timeout"]
    ],
    reference: "features/trustline-checker",
    notes:
      "The pasted-content path must make no request at all, which makes the whole validator testable without MSW. Structure the slice so the rule engine is a pure function and the fetch is a thin wrapper around it.",
    outOfScope: [
      "Do not validate SEP-6 or SEP-24 endpoint behaviour.",
      "Do not attempt to fix or rewrite the toml."
    ]
  },

  // -------------------------------------------------------------- developer
  {
    slug: "explorer-links",
    title: "Multi-Explorer Link Generator",
    category: "developer",
    difficulty: "medium",
    summary:
      "Paste any Stellar identifier — account, transaction, ledger, asset or contract — and get the correct link to it on every major explorer for the selected network.",
    why:
      "Every explorer uses a different URL shape, and building the right one by hand for the right network is a small tax paid many times a day.",
    source: "Local only. Identifiers are classified and URLs are built in the browser.",
    offline: true,
    criteria: [
      "The identifier type is detected automatically: G/M/C addresses, 64-hex transaction hashes, numeric ledger sequences and `CODE:ISSUER` asset pairs.",
      "Links are generated for at least three explorers, each labelled with the network it points at.",
      "Explorers that do not support a given identifier type are omitted, not rendered as broken links.",
      "The detected type is stated, so a misdetection is visible rather than silently wrong.",
      "Every link is copyable and opens in a new tab with `rel=\"noreferrer noopener\"`."
    ],
    codes: [
      ["empty_input", "nothing submitted"],
      ["unrecognised_identifier", "the value matches no known identifier shape"],
      ["ambiguous_identifier", "the value matches more than one shape"]
    ],
    reference: "features/address-validator",
    notes:
      "A 64-hex string is ambiguous — it could be a transaction hash, a pool ID or a raw contract hash. Handle that explicitly by offering both readings rather than silently picking one.",
    outOfScope: [
      "Do not fetch anything from the explorers.",
      "Do not embed explorer content."
    ]
  },
  {
    slug: "trade-history",
    title: "Trade History Viewer",
    category: "developer",
    difficulty: "medium",
    summary:
      "Browse executed trades for an asset pair or an account on Stellar's decentralised exchange, showing price, amounts and both counterparties.",
    why:
      "Executed trades are the record of what actually cleared, as opposed to what was offered. It is the ground truth behind any price question.",
    source: "Horizon `GET /trades` with asset pair or account filters.",
    criteria: [
      "Filtering by asset pair and by account are both supported and clearly distinguished.",
      "Each trade shows both sides with their assets and amounts, and the execution price.",
      "Prices use Horizon's exact `price` fraction rather than a rounded decimal.",
      "Liquidity-pool trades are distinguished from order-book trades.",
      "Cursor paging works and disables at the ends."
    ],
    codes: [
      ["empty_filter", "neither an asset pair nor an account was provided"],
      ["invalid_asset", "an asset code or issuer is invalid"],
      ["invalid_address", "the account fails the StrKey checksum"],
      ["no_trades", "the filter is valid but matched no trades"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/transaction-lookup",
    notes:
      "A trade has a base and a counter side, and which is which depends on the query, not on the pair. Getting that backwards inverts every price on the page.",
    outOfScope: [
      "Do not chart prices.",
      "Do not compute OHLC aggregates."
    ]
  },
  {
    slug: "offer-inspector",
    title: "Account Offers Inspector",
    category: "developer",
    difficulty: "medium",
    summary:
      "List an account's open offers on the decentralised exchange with the assets, amounts, prices and the reserve each offer consumes.",
    view: true,
    why:
      "Open offers lock up both a reserve and a selling liability, which is a common reason an account's spendable balance is lower than it looks.",
    source: "Horizon `GET /accounts/{account_id}/offers`.",
    criteria: [
      "Each offer shows selling and buying assets, amount, price and offer ID.",
      "The price is shown both as a decimal and as Horizon's exact fraction.",
      "The total reserve consumed by all open offers is computed and stated in XLM.",
      "Passive offers are distinguished from ordinary ones.",
      "An account with no open offers gets a clear empty result, distinct from an account that does not exist."
    ],
    codes: [
      ["empty_input", "no address submitted"],
      ["invalid_address", "fails the StrKey checksum"],
      ["account_not_found", "Horizon 404 on the selected network"],
      ["rate_limited", "Horizon 429"],
      ["request_failed", "5xx, transport failure or timeout"]
    ],
    reference: "features/balance-viewer",
    notes:
      "Each open offer is a subentry and therefore costs one base reserve. Connecting that to the spendable-balance question is what makes this more than a table of offers.",
    outOfScope: [
      "Do not create or cancel offers.",
      "Do not show the order book around each offer."
    ]
  }
];

export const categoryLabels = {
  accounts: "Accounts",
  assets: "Assets & Trustlines",
  payments: "Payments",
  transactions: "Transactions",
  soroban: "Soroban",
  network: "Network & Infrastructure",
  keys: "Keys & Encoding",
  standards: "Stellar Standards (SEPs)",
  developer: "Developer Utilities"
};
