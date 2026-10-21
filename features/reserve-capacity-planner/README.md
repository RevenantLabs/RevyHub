# Reserve Capacity Planner

Project the classic minimum XLM balance for a hypothetical account. The tool adds up trustlines, offers, data entries and signer subentries, then applies a base reserve. It does not look up an account, submit a transaction, or read the live ledger.

The base reserve is a network parameter and can change. A blank override uses the documented standard of **0.5 XLM = 5,000,000 stroops**. A typed amount replaces that standard for the scenario only. The result says which one it used. It is not a guarantee for every network at every time.

## Formula

All arithmetic uses integer stroops. One XLM is 10,000,000 stroops. Amounts never pass through floating-point numbers.

```text
subentry count = trustlines + offers + data entries + signer subentries
minimum balance (stroops) = base reserve (stroops) × (2 + subentry count)
```

The `2` is the classic account reserve: two base reserves before any subentry. Each counted subentry adds one more base reserve. That is the same product the live reserve calculator uses when sponsorship adjustments are zero: `(2 + subentry_count) × base_reserve`. This planner does not take sponsoring or sponsored counts, so it does not add or subtract them.

The signer field is the number of **signer subentries** (additional signers). The master key is already covered by the two account reserves and must not be entered again.

When a starting balance is provided:

```text
spendable = starting balance − minimum balance
```

If the starting balance is lower than the minimum, spendable is **0** and the result says the balance is short, including the shortfall. Leaving the starting balance blank skips that line.

### Worked values

| Scenario | Arithmetic | Minimum |
| --- | --- | --- |
| 1, 2, 3 and 4 subentries at 0.5 XLM | 5,000,000 × (2 + 10) | 60,000,000 stroops = 6 XLM |
| No subentries at 0.5 XLM | 5,000,000 × 2 | 10,000,000 stroops = 1 XLM |
| 10 subentries at 1.25 XLM | 12,500,000 × 12 | 150,000,000 stroops = 15 XLM |
| 1 subentry at 0.0000001 XLM | 1 × 3 | 3 stroops |

A 10 XLM start against the 6 XLM minimum leaves 4 XLM spendable (40,000,000 stroops). A 0.5 XLM start against the 1 XLM bare-account minimum leaves 0 spendable and a 0.5 XLM shortfall.

## Validation

Counts must be non-negative integers. A negative number, a decimal, or an exponent fails that field with its own message. The base reserve and the optional starting balance are non-negative XLM amounts with at most 7 decimal places. A negative starting balance has its own message. Anything that starts with `S` is treated as a secret key, cleared, and never stored.

## Why it is offline

Capacity planning happens before the account exists. Reading Horizon would answer a different question (the live reserve calculator does that). This slice keeps `networks: []` and `offline: true`, and its MSW handler list is empty.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata for an offline developer tool |
| `schema.ts` | Per-field validation without a request |
| `lib/hypothetical-subentries.ts` | Count parsing and the subentry sum |
| `lib/reserve-formula.ts` | Base reserve and the classic minimum |
| `lib/spendable-projection.ts` | Spendable balance above a starting balance |
| `lib/reserveCapacityPlanner.ts` | Orchestrates a `Result` |
| `hooks/` | Idle, local processing, success and error |
| `components/` | Form, projection, breakdown and empty state |
| `__tests__/` | Formula, validation, state, UI and accessibility |
| `fixtures/` | Hand-computed normal, default and custom scenarios |
| `msw/` | Empty, because nothing is requested |

## Safety

The planner never asks for a secret key. A pasted seed is discarded on the `S` prefix and is not copied into hook state or the result. No account id is required.
