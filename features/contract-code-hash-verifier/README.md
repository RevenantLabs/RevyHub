# Contract Code Hash Verifier

The contract ID is checked locally. A value that looks like a secret seed is
rejected before `getLedgerEntries` is called.

The first read is the persistent contract-instance ledger key. A Wasm
executable yields a second read of the `ContractCode` entry named by that
hash. SHA-256 is computed over the exact Wasm bytes in that entry and compared
with the instance hash. A built-in Stellar Asset Contract has no Wasm hash, so
the result is not applicable and the code entry is not fetched.

Each response includes its `latestLedger`. When the two markers differ, the
result says it is not an atomic snapshot. Missing entries, archived entries
(`liveUntilLedgerSeq` behind `latestLedger`), malformed XDR, Wasm larger than
131072 bytes, and transport failures each stop with their own message.

A matching hash does not mean the code is safe. This tool does not upload
Wasm, invoke a contract, restore an entry, extend TTL, or submit a transaction.

Run `npm run verify:features -- contract-code-hash-verifier`.
