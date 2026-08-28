# Network Fee Statistics

Reads Horizon's fee statistics for the selected network and turns them into a
fee you can actually bid.

## How it works

Horizon publishes two distributions, and the difference between them is the
point of this tool:

- **`fee_charged`** — what transactions actually paid. This is the distribution
  to bid against.
- **`max_fee`** — what transactions were *willing* to pay. Offering more than
  the charged fee costs nothing while the ledger has room, because the network
  only takes what it needs.

A tool that shows only one of them answers the wrong question, so both are
rendered as full percentile tables.

`ledger_capacity_usage` is turned into a congestion band (calm / busy /
congested) with thresholds declared in `lib/format.ts` so the UI and its tests
agree on where the boundaries are. The recommendation follows from that band —
P50 when calm, P90 when busy, P99 when congested — and the basis is always
stated, because a recommendation the reader cannot reason about is worse than
none.

## Precision

Fees are stroops, and `max_fee` reaches the int64 ceiling. `toStroopAmount`
converts by string padding rather than division, so nothing is parsed as a
float anywhere in this slice. A value that is not a non-negative integer
returns `null` and renders as "not reported" rather than as a wrong number.

## Degrading rather than failing

Horizon occasionally omits `ledger_capacity_usage`. That produces an `unknown`
congestion band and a stated fallback, while every percentile still renders —
losing one field must not cost the reader the whole page.

## Safety

Fee statistics are public network data. This tool is read-only and submits
nothing.
