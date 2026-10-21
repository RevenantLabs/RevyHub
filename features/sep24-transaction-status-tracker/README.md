# SEP-24 Transaction Status Tracker

Reads `TRANSFER_SERVER_SEP0024` from `https://{home-domain}/.well-known/stellar.toml`, then requests `GET {transfer-server}/transactions/{id}` with the pasted SEP-10 JWT as a bearer token.

An expired or malformed token, and an anchor response of 401 or 403, are `unauthorized`. A 404 after the token is accepted is `transaction_not_found`. An anchor toml with no `TRANSFER_SERVER_SEP0024` is `missing_transfer_server`.

Every documented SEP-24 status has a plain-language explanation and a next step. An unknown status is labeled undocumented instead of being guessed.

The token is sent once and is not copied into the result, logs, or storage. This tool does not start a SEP-10 challenge and does not create a deposit or withdrawal.
