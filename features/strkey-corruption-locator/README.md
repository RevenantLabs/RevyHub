# StrKey Corruption Locator

Finds the most likely single mistyped character in a public Stellar StrKey. The check is local: it asks `@stellar/stellar-sdk` `StrKey` whether a substitution has a valid checksum, and it never calls Horizon or RPC.

## How it works

1. Whitespace is stripped. An empty paste, a secret-seed version byte (`S`, from `StrKey.getVersionByteForPrefix`), a string longer than 165 characters, or any other non-StrKey length is rejected before search.
2. A string the SDK already accepts is rejected with `already_valid`. No correction is produced.
3. Otherwise every other character in the StrKey alphabet (`A-Z` and `2-7`) is tried at every position. Secret-shaped substitutions are skipped and never decoded.
4. Hits are ranked by position, earliest first, and the panel shows at most **8** (`MAX_VISIBLE_CANDIDATES` in `lib/candidate-rank.ts`). The total is still reported when more exist.
5. When nothing validates, the result is `no_candidates` / `no_candidates_found`. That is a finished diagnosis, not an error: two or more corrupted characters usually land here.

Lengths come from the SDK's own gates: 56 for account, contract, pre-auth and hash-x keys, 69 for muxed accounts, and 56–165 for signed payloads. The checksum implementation is the SDK's CRC16-XModem check inside `StrKey.isValid*` and `StrKey.decode*`. This slice does not reimplement it.

## Data boundaries

- Fully offline. `networks` is empty, `offline` is true, and the MSW handler list is empty.
- Secret seeds are dropped on the version byte alone. They are not checksum-tested, not stored on hook state, and not rendered. `SecretSeedGuard` takes no value prop.
- Fixtures derive addresses from `Keypair.fromRawEd25519Seed` with fixed fill bytes. Those seeds are test patterns, not live keys, and the secret string is only used to assert absence.

## Out of scope

Multi-character repair, and any network lookup of whether a candidate account exists.

## Files

| Path | Responsibility |
| --- | --- |
| `lib/strkey-alphabet.ts` | Alphabet, version byte, SDK checksum classification |
| `lib/single-char-search.ts` | Exhaustive one-character substitution |
| `lib/candidate-rank.ts` | Position ranking and the 8-candidate bound |
| `lib/strkeyCorruptionLocator.ts` | Result orchestration, including the no-candidates outcome |
| `components/CandidateRows.tsx` | Ranked corrections, wrapping at narrow widths |
| `components/NoCandidatesNotice.tsx` | Explicit no-candidates status |
| `components/SecretSeedGuard.tsx` | Secret-seed rejection without echoing the input |
