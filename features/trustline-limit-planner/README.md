# Trustline Limit Change Planner

Validates a single credit_alphanum4/alphanum12 Horizon balance row and a proposed
nonnegative limit, bounded by Stellar’s signed-int64 stroop amount range. Asset
identity includes the exact case-sensitive code and public issuer.

Receiving headroom is `limit - balance - buying_liabilities`; negative headroom
is shown instead of clamped. A proposed limit below the existing balance plus
buying liabilities is blocked. Selling liabilities are displayed but do not reduce
receiving headroom; zero-limit deletion separately requires zero balance and both
liabilities. Missing amounts yield incomplete_snapshot, not guessed zeroes.

Authorization flags are displayed as present, false, or unknown. A satisfiable
numeric constraint is only a candidate, not evidence of receiving authorization
or a valid change-trust transaction. Pasted snapshots cannot prove live state or
other transaction-level requirements. No operations are built.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- trustline-limit-planner`.
