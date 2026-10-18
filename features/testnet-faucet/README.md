# Testnet Faucet

Funds a Stellar **testnet** account through Friendbot, and explains precisely
why a request was refused.

## How it works

Friendbot returns HTTP 400 both for "this account already exists" and for a
genuinely malformed request, so the status code alone is not enough.
`classifyFriendbotResponse` inspects the body to separate the two, which is the
difference between a useful message and a dead end — an account that already
exists is not an error the user can fix by retrying.

A success whose body cannot be parsed is still a success: the account was
funded regardless of what came back, so the result is returned without a
transaction hash rather than as a failure.

There is deliberately **no mainnet path**. The manifest declares
`networks: ["testnet"]`, and selecting mainnet in the header shows a warning
instead of changing what the tool does — Friendbot simply does not exist there,
and real XLM is not something a faucet hands out.

## Safety

Funding an account needs only its **public** address. A value starting with `S`
is a secret seed and is rejected by the same checksum rule that rejects any
non-`G` value, before any request is made.
