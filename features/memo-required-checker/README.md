# SEP-29 Memo Required Checker

Loads a destination account from the selected Horizon network and reads the SEP-29 data entry `config.memo_required`. The only defined value is the single character `1`, which Horizon returns as base64. Any other value is `malformed_data_entry`, not a not-required result. A missing key is an absent signal.

When the account publishes a `home_domain`, the tool also fetches `https://{home_domain}/.well-known/stellar.toml` and reads a self-published `MEMO_REQUIRED = true|false` line. SEP-29 itself does not define that line. A failed fetch is `toml_unreachable`. An account with no home domain skips the toml check.

Either source that says a memo is required produces a required verdict, and the result names which source did. If the data entry requires a memo and the toml says `false`, both signals stay visible and the verdict stays required. When neither source requires a memo, the verdict is explicitly not required.

The notice is best-effort. An exchange that never sets the data entry can still expect a memo.

Secret seeds are rejected before any request. This tool does not build or submit a payment.
