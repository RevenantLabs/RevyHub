# Ledger Range and Retention Planner

All ledger inputs are positive uint32 values parsed as BigInt. Chunks are inclusive
with count `end - start + 1`. Total chunks are calculated before allocating rows;
more than 1000 yields a bounded error with the exact total in its detail.

The original interval is never silently clipped. A retention window must have both
bounds, and only the explicit retained-intersection scope changes the exported
interval. Each chunk reports its retained/older/future intersections, including
chunks spanning a retention boundary. An empty retained intersection produces zero
rows, not an invented interval. Exports label the supplied retention assumption
and selected scope. No live provider reachability or history availability is claimed.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- ledger-range-planner`.
