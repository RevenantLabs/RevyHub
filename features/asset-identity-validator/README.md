# Asset Code & Issuer Identity Validator

Checks a classic Stellar asset code and its issuer in the browser, then shows
the canonical `code:issuer` string. It does not ask Horizon or RPC whether
that asset exists, has a trustline, or holds a balance.

## How it works

Validation is ordered, and each failure has its own code:

1. A value whose first character is `S` is a secret seed. It is rejected on
   that prefix, before any checksum and before `Asset` is constructed, and it
   is removed from the issuer field. The result never contains the seed.
2. Length picks the tier: 1–4 characters is alphanumeric 4, 5–12 is
   alphanumeric 12. Anything longer is `invalid_code_length`, even if the
   characters would also be wrong.
3. The alphabet is uppercase `A–Z` and digits `0–9`. Lowercase is not
   rewritten into a canonical code. The SDK will accept `usdc`; this tool
   reports `invalid_code_characters` instead, because a close-enough code is
   not the code the user will publish.
4. `XLM` with any non-empty issuer is `reserved_native_conflict`. The SDK will
   construct that pair as a credit asset. This tool refuses it so the reserved
   native code is not presented as an issued asset. `XLM` with an empty issuer
   is `invalid_issuer`, because this tool checks a pair and the native asset
   has no issuer to show.
5. The issuer must be an Ed25519 public address (`G…`). Contract and muxed
   addresses fail `invalid_issuer`.
6. On success, `new Asset(code, issuer)` confirms the SDK tier, and the
   canonical string is `code:issuer` — the same text `Asset#toString()` returns
   for a credit asset.

The hook yields one event-loop turn while it checks, so the panel can show
idle, loading, success and error. Changing the selected network does not clear
or recompute a result: identity rules are not network-specific, and nothing is
fetched.

## Result codes

| Code | Meaning |
| --- | --- |
| `empty_code` | The code was blank after trimming |
| `invalid_code_length` | Not 1–4 and not 5–12 characters |
| `invalid_code_characters` | Length was a real tier, but a character was outside `A–Z` and `0–9` |
| `invalid_issuer` | Missing, malformed, or a secret seed that was discarded |
| `reserved_native_conflict` | `XLM` was submitted with a custom issuer |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata. `networks: []`, `offline: true` |
| `schema.ts` | Trim, strip issuer whitespace, reject a secret before it is returned |
| `lib/code-length-tier.ts` | Alphanumeric 4 vs 12 |
| `lib/code-characters.ts` | Alphabet check |
| `lib/canonical-asset-string.ts` | `code:issuer` builder |
| `lib/assetIdentityValidator.ts` | Ordered rules and the SDK confirmation |
| `lib/assetIdentityValidator.errors.ts` | Secret detection and throw mapping |
| `lib/format.ts` | Tier, length and canonical display |
| `hooks/useAssetIdentityValidator.ts` | Idle, loading, success, error |
| `components/` | Form, result, empty state, tier badge, issuer, canonical string |
| `msw/handlers.ts` | Empty. This slice makes no requests |
| `fixtures/` | Derived addresses and tier edge cases |

## Safety

No secret key is accepted, stored in hook state, or written into the page.
There is no amount in this tool, so there is no float parsing. The check is
local: a valid result does not mean the asset is issued on any network.
