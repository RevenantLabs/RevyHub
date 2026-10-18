# Stellar Price Fraction Workbench

Reduces decimal or fraction input with Euclid’s algorithm before enforcing positive
signed-int32 numerator and denominator bounds. Large reducible inputs are allowed
within the 100-character input bound; the reduced representation determines fit.
Unrepresentable decimals are rejected instead of silently approximated, so signed
representation error is exactly 0/1 for every successful result.

The decimal preview uses integer division at a bounded precision of 0–18, explicitly
truncating toward zero. The preview is not a claim that a repeating fraction has a
finite exact decimal expansion. The inverse swaps reduced numerator and denominator.
Mode and precision edits invalidate existing results. No ledger or network state
is inferred from a representable Price.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- price-fraction-lab`.
