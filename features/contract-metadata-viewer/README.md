# Soroban Contract Metadata Viewer

Resolves a public contract instance and its referenced code through Stellar RPC `getLedgerEntries`, rejects Wasm above 1 MiB, then parses custom sections locally.

`contractenvmetav0` is required and yields the protocol/pre-release interface version. `contractmetav0` is decoded separately as XDR key/value entries; its absence is a successful “none published” result.

The feature reads public ledger state only. It never invokes, deploys or signs a contract and rejects secret-key-shaped input before any request.
