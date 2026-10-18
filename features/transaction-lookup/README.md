# Transaction Lookup

Resolves a transaction hash to its ledger position, fee, memo, success flag and
operation list.

## How it works

Horizon exposes the transaction and its operations as two separate resources,
so this tool makes two requests. The second one is treated as non-fatal: a
transaction whose operation list cannot be read is still worth showing, so an
operations failure yields an empty list rather than an error page. One test
covers exactly that combination.

A **failed transaction is not an error**. `successful: false` is a legitimate
result that the ledger recorded, and it is rendered as a red status *result*,
not as a request failure. Only 404 / 429 / transport problems become error
codes.

Fees are converted with `BigInt`, never floats: `max_fee` can reach the int64
ceiling, which `Number` cannot represent exactly.

Because a testnet hash generally does not exist on mainnet, switching the
network clears the result instead of leaving a stale transaction on screen.

## Safety

Transactions are public ledger data. This tool is read-only; it never builds,
signs or submits anything.
