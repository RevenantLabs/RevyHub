# Payment CSV Import Preflight

Reads a payout CSV before anyone builds a transaction from it. Every row is
validated — destination, amount, asset identity and memo — and the report shows
exact per-asset totals, duplicate payments and row-by-row advice on what to fix.

Everything happens in the browser. The tool makes **no network requests** and
constructs, signs and submits **nothing**.

## What it does

- Accepts pasted text or a local file, read with `File.text()` and never uploaded.
- Parses RFC 4180 quoting: commas inside quoted values, doubled quotes as an
  escape, values spanning several lines, CRLF or LF endings, and the byte-order
  mark a spreadsheet writes.
- Requires the headers `destination, amount, asset_code, asset_issuer` in any
  order, and reads `memo_type, memo_value` when present. Unknown columns are
  ignored; a repeated column is rejected.
- Validates `G…` and `M…` destinations, keeping a muxed address exactly as
  written, and rejects a secret key without ever echoing it back.
- Validates amounts as strings and `BigInt` with exact seven-decimal arithmetic.
- Groups totals by full asset identity, flags duplicate rows, and offers a local
  JSON export that is blocked while any row is invalid.

## The non-obvious decision

**A bad row does not fail the import.**

The obvious design returns an error for a file containing an invalid address.
That is the wrong shape for this tool: a 500-row payout file with one typo would
produce a single error message and no visibility into the other 499 rows, so the
operator has to fix one row, re-run, and discover the next one. Instead, row
problems are a separate vocabulary — `RowIssueCode` in `types.ts` — attached to
the row that caused them, and the top-level `Result` stays `ok`. The whole file
is always readable, in its original order, with its own line numbers.

`invalid_rows` therefore exists for exactly one moment: the **export**. That is
the only action that hands the data to something else, and a partially validated
payout list is precisely what must not leave this page.

Three smaller decisions follow the same logic:

- **Duplicates are flagged, never merged.** Paying someone twice can be
  deliberate. Collapsing two rows into one would silently change the amount
  leaving the account, so both rows stay and both are marked.
- **Totals are keyed by code *and* issuer.** Two assets sharing a code are two
  different assets; totalling them together would hide the mistake this tool
  exists to catch. A file containing both gets an explicit warning.
- **A repeated header is rejected rather than resolved.** Reading the first or
  the last occurrence both silently read a different column than the author
  intended.

## Limits

| Bound | Value | Why |
| --- | --- | --- |
| `MAX_CSV_LENGTH` | 2,000,000 characters | Keeps the parser off the main thread's back |
| `MAX_FILE_BYTES` | 4 MB | Checked against `File.size` before a byte is read |
| `MAX_ROWS` | 10,000 payment rows | Bounded render and bounded validation |

## Error codes

| Code | When | What the copy tells the user |
| --- | --- | --- |
| `empty_input` | Nothing pasted or an empty file | Paste CSV or choose a file |
| `invalid_input` | NUL bytes — a spreadsheet or UTF-16 export | Re-save as UTF-8 CSV |
| `input_too_large` | Over a documented bound | Split into smaller batches |
| `invalid_csv` | Unterminated quote, or a quote inside a value | How to quote correctly, with the line it began on |
| `invalid_headers` | A required header is missing or repeated | The exact header line required |
| `invalid_rows` | Export attempted with invalid rows | Fix or remove the listed rows |

Row issues (`RowIssueCode`) are not error codes — they are per-row advice, one
entry each in `rowIssueCopy`.

## What it deliberately does not check

Every check is structural and offline, so the tool **cannot** tell you whether:

- the destination account exists on any network,
- the destination holds a trustline for the asset, or is authorised to,
- the asset's issuer exists or has frozen the asset,
- the sending account can actually afford the totals.

Confirm those separately before paying. The result panel says so in the UI too.

## Files

| Path | Responsibility |
| --- | --- |
| `manifest.ts` | Registry metadata — offline, no networks |
| `schema.ts` | Header schema, input bounds, binary-content rejection |
| `lib/csv.ts` | Bounded RFC 4180 reader written for this slice |
| `lib/paymentCsvPreflight.ts` | Row validation, duplicates, exact totals, export |
| `lib/paymentCsvPreflight.errors.ts` | Local file-read failures → this tool's codes |
| `lib/format.ts` | Amount, asset, advice and filter presentation |
| `hooks/usePaymentCsvPreflight.ts` | idle / loading / success / error, with stale-read protection |
| `components/` | Form, report, empty state and panel |
| `__tests__/` | Logic, CSV parser, schema, format, hook, component and a11y |
| `fixtures/` | Payout CSVs built from fixed seeds |
| `msw/handlers.ts` | Empty — an offline tool has nothing to mock |

## Safety

A value starting with `S` is rejected on its prefix alone, before any checksum
work, so a seed is never decoded. The row's destination is blanked in the parser
and rendered as "Secret key — not shown"; tests assert the seed appears in
neither hook state nor the document. If a secret key was pasted here, treat it
as compromised — anywhere it has been pasted is one place too many.
