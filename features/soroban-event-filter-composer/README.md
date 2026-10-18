# Soroban Event Filter Composer

getEvents filters are built locally, then optionally sent to the selected
network's Soroban RPC endpoint. Contract IDs must be `C…` StrKeys. Topic
selectors are `*`, `sym:name`, or canonical base64 ScVal XDR. The preview is
the exact `getEvents` parameter object, including `startLedger` and a page
size capped at 20.

A cursor is attached only when `cursorNetwork` equals the network that will
receive the request. Switching networks drops the previous page, so a cursor
from testnet cannot be replayed against mainnet. Returned topic and value XDR
is decoded for display; bytes that are not ScVal stay as the word `undecoded`
and are not executed.

`getLatestLedger` supplies `oldestLedger`. A start ledger below that window
returns `history_unavailable` before `getEvents`. An empty event list is a
successful read. Rows are capped at 20. Secret seeds are rejected in the form
and never included in the filter object.

Run `npm run verify:features -- soroban-event-filter-composer`.
