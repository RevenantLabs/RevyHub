# StrKey Type Inspector

Uses the installed SDK decoders for G, M, C, T, X and P. Each kind is selected
from its encoded version prefix, and SDK decoding validates encoding, length and
checksum. Unknown/newer kinds are explicitly unsupported; they are never reported
as decoded. Bad-checksum advice also covers malformed supported encodings.

Input is bounded to 1024 characters. S-prefixed values are rejected on prefix
alone in both schema and domain, and discarded by the form before entering state.
Muxed IDs stay exact uint64 strings; the base G account is shown separately.
Raw payload hex includes the signed-payload encoding for P identifiers.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- strkey-inspector`.
