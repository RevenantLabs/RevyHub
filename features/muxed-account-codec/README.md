# Muxed Account Encoder and Decoder

Uses the installed SDK muxed-account encoder and decoder (SEP-23). Public address
checksums are validated before conversion. IDs are parsed as bounded BigInt and
passed to the SDK as decimal strings; zero and the uint64 maximum are valid.
Leading zeroes in an entered ID normalize to the same routing ID. An M address
round-trips exactly, and its underlying G account is shown separately.

Mode selection is explicit. Fields identify which mode uses them; edits to any
field or mode discard old results. S-prefixed inputs are discarded in the form
and rejected again in schema. Fixtures derive public keys from fixed seeds.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- muxed-account-codec`.
