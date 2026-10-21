# Clawback Eligibility Checker

Checks whether a specific holder's trustline for a specific asset is
currently clawback-eligible, by combining the issuer's account-level
`auth_clawback_enabled` flag with the holder's own trustline-level
`is_clawback_enabled` flag — two independent signals, read separately.

## How it works

**Data source:** Horizon `GET /accounts/{issuer_account_id}` and
`GET /accounts/{holder_account_id}` for the matching trustline's flags.

1. `schema.ts` validates both account IDs (rejecting anything that looks
   like a secret key on sight) and the asset code before any request.
2. `lib/issuer-clawback-flag.ts` and `lib/holder-trustline-flag.ts` fetch the
   issuer and holder accounts **in parallel** via `Promise.all` — not
   sequentially — so a failure on one side never blocks reading the other.
3. `lib/eligibility-merge.ts` combines the two outcomes into a verdict:
   eligible only when both signals agree the flag is on, not-eligible when
   both agree it's off, and an explicit **disagreement** when they differ.

## The non-obvious decision

A trustline created before the issuer enabled `auth_clawback_enabled` can
carry its own `is_clawback_enabled: false` independent of the issuer's
*current* setting — the holder-level flag is fixed at trustline-change time,
not derived live from the issuer. The reverse is also possible after an
issuer reverses the flag. For this reason:

- This tool **never infers one flag from the other.** A disagreement is
  reported as its own verdict, with both raw values, rather than resolved
  by assuming the issuer's current flag always wins.
- Both account fetches run in parallel and **both outcomes are always
  shown**, even when one request fails — aborting on the first error would
  hide a case where, say, the holder's data is clearly available but the
  issuer lookup timed out, and `verdict: "unknown"` already says plainly
  that eligibility could not be determined.
- A holder with no trustline to the asset at all (`no_trustline`) is kept
  distinct from a holder whose trustline exists but isn't clawback-eligible
  — the two situations call for different next steps.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata and supported networks |
| `schema.ts` | Input parsing and validation |
| `lib/issuer-clawback-flag.ts` | Reads the issuer's `auth_clawback_enabled` flag |
| `lib/holder-trustline-flag.ts` | Reads the holder's trustline-level `is_clawback_enabled` flag |
| `lib/eligibility-merge.ts` | Merges both signals into one verdict |
| `lib/clawbackEligibilityChecker.ts` | Orchestrates the two fetches in parallel |
| `hooks/` | React state machine |
| `components/IssuerSignal.tsx`, `HolderSignal.tsx` | Show each signal independently |
| `components/EligibilityVerdict.tsx` | Shows the combined verdict |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic sample data, including the eligible and disagreeing-signals edge cases |
| `msw/` | Request mocks |
| `e2e/` | Declarative end-to-end specifications |

## Safety

This tool never accepts, displays, stores or transmits a secret key. Both
account ID fields reject any value starting with `S` on sight, before any
request is built, and the rejection is covered by a test asserting the
secret never appears in component output or hook state.
