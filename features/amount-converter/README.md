# Stroop and Amount Converter

Converts between Stellar stroops and seven-decimal display amounts in both
directions, using exact `BigInt` arithmetic. Floating-point numbers never enter
the conversion path.

## How it works

Stellar stores native amounts as signed 64-bit integers counted in stroops
(10,000,000 stroops = 1 XLM). Horizon and wallets show the same value with up
to seven decimal places.

`convertFromStroops` and `convertFromAmount` in `lib/amountConverter.ts`
implement the paired conversion. Formatting helpers in `lib/format.ts` follow
the same patterns as `features/reserve-calculator/lib/format.ts`.

Editing either field updates the other immediately. A ref inside the hook
updates only the opposite field so the two inputs never ping-pong.

Amounts with more than seven decimal places are rejected with
`too_many_decimals` — the error copy explains that extra digits would be lost.
Values above the int64 maximum (`9,223,372,036,854,775,807` stroops) return
`out_of_range`.

## Result codes

| Code | Meaning |
| --- | --- |
| `empty_input` | Both fields were cleared |
| `invalid_amount` | Not a well-formed stroop integer or decimal amount |
| `too_many_decimals` | More than seven digits after the decimal point |
| `out_of_range` | Stroops exceed the int64 maximum |
| `negative_not_allowed` | A minus sign was entered |

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata (`offline: true`, no networks) |
| `schema.ts` | Input normalisation |
| `lib/amountConverter.ts` | Bidirectional conversion and range checks |
| `lib/format.ts` | Stroop/amount formatting |
| `hooks/useAmountConverter.ts` | Synchronous state machine |
| `components/` | Form, result, empty state and panel |
| `__tests__/` | Unit, hook, component and accessibility tests |
| `fixtures/` | Deterministic conversion samples |
| `msw/handlers.ts` | Empty — this tool makes no requests |

## Safety

This tool never asks for a secret key and makes no network requests of any
kind. All arithmetic stays in exact integer stroops.
