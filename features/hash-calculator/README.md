# Stellar Hash Calculator

SHA-256 hashes the selected decoded bytes with Web Crypto. Input text is UTF-8
without trimming; hex is strict even-length input and base64 is normalized only
for whitespace, then round-tripped to reject noncanonical encodings. Empty input
is explicitly rejected. The input bound is 262144 characters.

Transaction mode first validates a complete XDR TransactionEnvelope and rejects
trailing bytes, then uses the installed SDK’s network-dependent transaction hash
(including fee-bump semantics). Standard testnet/mainnet or an exact custom
passphrase is selected locally, independent of the header network. Whitespace in
a custom passphrase is preserved; whitespace-only passphrases are rejected.
No signatures are verified and a digest is not evidence of transaction validity.

The tool is fully offline: no requests, signing, submissions, or persistence.
Inputs and derived results are discarded on reset; edits invalidate pending work.
All amounts and large integers use strings/BigInt. Local JSON is deterministically
key-sorted. Tests use fixed fixtures, MSW with no handlers, hook/DOM scenarios and
axe in idle/success states. The E2E specification is documented; there is no
configured browser runner.

Run `npm run check` and `npm run verify:features -- hash-calculator`.
