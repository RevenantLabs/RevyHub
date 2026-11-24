# Soroban Auth Nonce and Expiry Auditor

Paste one base64 `SorobanAuthorizationEntry` XDR per line and choose an explicit network passphrase; the form does not assume a default network. Supply a decimal evaluation ledger to classify expiry; without it expiry is unknown. This is an offline, read-only inspection of user-provided evidence.

The installed Stellar SDK's XDR supports `SOROBAN_CREDENTIALS_SOURCE_ACCOUNT` and `SOROBAN_CREDENTIALS_ADDRESS`. Source-account entries have no address, nonce, signature or expiration field; their account identity requires transaction/operation context and is never guessed. Address identities include the full checked G/C address and explicit network passphrase. Reuse means equal nonces for that full identity within the pasted bundle. Different addresses are separate. Expiration is inclusive: the expiration check passes when `evaluationLedger <= signatureExpirationLedger` and fails afterward.

Presence of a non-void signature SCVal is reported only as payload presence. The tool does not verify signatures or query chain nonce availability. It does not infer the network from XDR. Unsupported credential variants and malformed bytes produce errors; missing evaluation context produces an incomplete-evidence result. Current ledger-dependent upper expiration bounds are not assessed without live network configuration. Any credential or `ScAddress` discriminant that the installed SDK XDR does not define (for example variants introduced by later protocol versions) is reported as `unsupported_variant` rather than guessed.

Secret-key guard: every valid entry's base64 starts with `AAAA` (its 4-byte credential discriminant), so any bundle token starting with `S` is rejected on the prefix alone without false positives on seed-shaped text inside valid base64.

Modules: `lib/nonce-reuse-index.ts` decodes each credential into source-account or address evidence (checked G/C strkey, exact int64 nonce, uint32 expiration, payload presence) and groups reuse by the `[network, address, nonce]` identity; `lib/expiry-readiness.ts` applies the inclusive expiration boundary; `lib/sorobanAuthNonceExpiryAuditor.ts` composes them.

Limits: 50 entries, 16,384 base64 characters per entry, 131,072 total input characters and a 256-character passphrase. No secret keys, signing, storage, wallet connection or requests.
