# Freighter Connect

Detects the Freighter browser extension, reads its public key and selected
network, and warns when that network disagrees with the one selected in the
header.

## How it works

All wallet access goes through `readFreighterApi`, which reads
`window.freighterApi` and verifies it exposes the methods this tool needs.
Extension APIs change between versions, so a partially present object becomes
its own reportable state (`api_incomplete`) instead of a runtime crash.

Three situations that look similar are kept apart deliberately:

- **not installed** — no API on `window` at all.
- **not allowed** — installed and healthy, but the user has not granted this
  site access. This is a *successful* snapshot, not an error, because the UI
  can act on it by offering a connect button.
- **read failed** — the API is present and permitted but threw, typically a
  locked wallet.

Because the extension injects itself asynchronously, the first read happens
after mount and `Check again` re-reads without a page reload — so installing
Freighter in another tab and coming back works.

## Network mismatch

Freighter reports networks as free-form strings that have changed across
versions (`TESTNET`, `PUBLIC`, `Test SDF Network ; September 2015`).
`normalizeWalletNetwork` matches on substrings and maps anything unrecognised —
futurenet, custom networks — to `unknown`. A mismatch is only reported when
*both* sides are known, so an unrecognised network is shown as unrecognised
rather than raising a false alarm.

## Safety

This tool only reads the wallet's **public** key and network. It never requests
a secret key, never builds a transaction and never asks Freighter to sign
anything.
