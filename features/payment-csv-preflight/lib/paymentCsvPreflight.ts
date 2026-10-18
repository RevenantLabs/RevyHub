import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { parseCsv, withoutBlankRows } from "@/features/payment-csv-preflight/lib/csv";
import {
  MAX_ROWS,
  readHeaders,
  type HeaderMap
} from "@/features/payment-csv-preflight/schema";
import type {
  AssetIdentity,
  AssetTotal,
  PaymentRow,
  PreflightErrorCode,
  PreflightInput,
  PreflightReport,
  RowIssueCode
} from "@/features/payment-csv-preflight/types";

const STROOPS_PER_UNIT = 10_000_000n;

/** The largest amount the protocol can hold, in stroops. */
export const MAX_STROOPS = 9_223_372_036_854_775_807n;

const AMOUNT_SHAPE = /^\d+(\.\d+)?$/;
const ASSET_CODE_SHAPE = /^[A-Za-z0-9]{1,12}$/;
const MEMO_TYPES = new Set(["text", "id", "hash", "return"]);

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export function toStroops(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole || "0") * STROOPS_PER_UNIT + BigInt(fraction.padEnd(7, "0").slice(0, 7));
}

export function fromStroops(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_UNIT;
  const fraction = (stroops % STROOPS_PER_UNIT).toString().padStart(7, "0");
  return `${whole}.${fraction}`;
}

/**
 * Validates an amount with exact seven-decimal arithmetic.
 *
 * `parseFloat` would accept `1e3`, silently round an eighth decimal place away
 * and lose precision entirely past the safe integer range — on a payout file,
 * each of those is money going to the wrong place.
 */
export function validateAmount(raw: string): RowIssueCode | null {
  if (!raw) return "missing_amount";
  if (!AMOUNT_SHAPE.test(raw)) return "invalid_amount";

  const [, fraction = ""] = raw.split(".");
  if (fraction.length > 7) return "too_many_decimals";

  const stroops = toStroops(raw);
  if (stroops <= 0n) return "non_positive_amount";
  if (stroops > MAX_STROOPS) return "amount_too_large";

  return null;
}

/**
 * Resolves the asset a row pays in.
 *
 * The identity always carries the issuer, so two assets sharing a code are
 * never totalled together — paying out against the wrong issuer's asset is the
 * quiet mistake this whole tool exists to catch.
 */
export function resolveAsset(
  code: string,
  issuer: string
): { asset: AssetIdentity | null; issue: RowIssueCode | null } {
  const normalizedCode = code.trim();
  const normalizedIssuer = issuer.trim();
  // Deliberately independent of whether an issuer was given: `XLM` with an
  // issuer must be reported, not quietly accepted as an issued asset that
  // happens to be called XLM. On a payout file that ambiguity is the whole
  // point of the check.
  const isNative =
    normalizedCode.toLowerCase() === "native" || normalizedCode.toUpperCase() === "XLM";

  if (isNative) {
    if (normalizedIssuer) return { asset: null, issue: "unexpected_issuer_for_native" };
    return {
      asset: { key: "native", code: "XLM", issuer: null, isNative: true },
      issue: null
    };
  }

  if (!normalizedCode) return { asset: null, issue: "missing_asset_code" };
  if (!ASSET_CODE_SHAPE.test(normalizedCode)) return { asset: null, issue: "invalid_asset_code" };
  if (!normalizedIssuer) return { asset: null, issue: "missing_asset_issuer" };
  if (!StrKey.isValidEd25519PublicKey(normalizedIssuer)) {
    return { asset: null, issue: "invalid_asset_issuer" };
  }

  return {
    asset: {
      key: `${normalizedCode}:${normalizedIssuer}`,
      code: normalizedCode,
      issuer: normalizedIssuer,
      isNative: false
    },
    issue: null
  };
}

/**
 * Validates a destination address.
 *
 * `G…` and `M…` are both accepted and kept exactly as written — a muxed
 * address identifies a different payee than its underlying account, and
 * flattening it would send money to the wrong sub-account.
 */
export function validateDestination(raw: string): RowIssueCode | null {
  const destination = raw.trim();
  if (!destination) return "missing_destination";

  // Checked on the prefix alone, before any checksum work, so a seed is never
  // decoded — and the caller drops the value rather than echoing it.
  if (SECRET_SEED.test(destination)) return "secret_key_destination";

  if (destination.startsWith("M")) {
    return StrKey.isValidMed25519PublicKey(destination) ? null : "invalid_destination";
  }

  return StrKey.isValidEd25519PublicKey(destination) ? null : "invalid_destination";
}

function readField(fields: string[], columns: HeaderMap["columns"], name: string): string {
  const index = columns.get(name as never);
  if (index === undefined) return "";
  return (fields[index] ?? "").trim();
}

function validateMemo(type: string, value: string): RowIssueCode | null {
  if (!type && !value) return null;
  if (!type) return "memo_value_without_type";
  if (!MEMO_TYPES.has(type.toLowerCase())) return "invalid_memo_type";
  return null;
}

/**
 * Marks rows that pay the same destination in the same asset.
 *
 * Nothing is dropped or merged: a payout file may legitimately pay someone
 * twice, and silently collapsing two rows into one would change the amount
 * that leaves the account. They are flagged and left in place for a human to
 * decide about.
 */
export function markDuplicates(rows: PaymentRow[]): void {
  const groups = new Map<string, PaymentRow[]>();

  for (const row of rows) {
    if (!row.valid || !row.asset) continue;
    const key = `${row.destination}|${row.asset.key}`;
    const existing = groups.get(key);
    if (existing) existing.push(row);
    else groups.set(key, [row]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    for (const row of group) {
      row.duplicateOf = group.filter((other) => other !== row).map((other) => other.line);
    }
  }
}

/** Totals the valid rows per asset, exactly, in first-appearance order. */
export function totalsByAsset(rows: PaymentRow[]): AssetTotal[] {
  const totals = new Map<string, { asset: AssetIdentity; stroops: bigint; rowCount: number }>();

  for (const row of rows) {
    if (!row.valid || !row.asset) continue;

    const existing = totals.get(row.asset.key);
    if (existing) {
      existing.stroops += toStroops(row.amount);
      existing.rowCount += 1;
      continue;
    }

    totals.set(row.asset.key, {
      asset: row.asset,
      stroops: toStroops(row.amount),
      rowCount: 1
    });
  }

  return [...totals.values()].map((entry) => ({
    asset: entry.asset,
    total: fromStroops(entry.stroops),
    rowCount: entry.rowCount
  }));
}

/**
 * Reads and validates a payout CSV entirely in the browser.
 *
 * A row that fails validation does not fail the import: the report carries
 * every row, in its original order, with its own issues. A file with one bad
 * address is still worth seeing in full — rejecting it outright would hide the
 * other 499 rows that are fine.
 */
export function runPreflight({ csv }: PreflightInput): Result<PreflightReport, PreflightErrorCode> {
  const parsed = parseCsv(csv);
  if (!parsed.ok) return err("invalid_csv", parsed.line);

  const records = withoutBlankRows(parsed.rows);
  if (!records.length) return err("invalid_headers");

  const [header, ...dataRows] = records;
  const headers = readHeaders(header.fields);
  if (!headers.ok) return err(headers.code);

  if (dataRows.length > MAX_ROWS) return err("input_too_large");

  const columnCount = header.fields.length;
  const rows: PaymentRow[] = dataRows.map((record, position) => {
    const issues: RowIssueCode[] = [];

    // A short or long row means the columns no longer line up, so nothing read
    // from it can be trusted — including which value was the destination.
    if (record.fields.length !== columnCount) issues.push("wrong_column_count");

    const rawDestination = readField(record.fields, headers.value.columns, "destination");
    const amount = readField(record.fields, headers.value.columns, "amount");
    const code = readField(record.fields, headers.value.columns, "asset_code");
    const issuer = readField(record.fields, headers.value.columns, "asset_issuer");
    const memoType = readField(record.fields, headers.value.columns, "memo_type");
    const memoValue = readField(record.fields, headers.value.columns, "memo_value");

    const destinationIssue = validateDestination(rawDestination);
    if (destinationIssue) issues.push(destinationIssue);

    const amountIssue = validateAmount(amount);
    if (amountIssue) issues.push(amountIssue);

    const { asset, issue: assetIssue } = resolveAsset(code, issuer);
    if (assetIssue) issues.push(assetIssue);

    const memoIssue = validateMemo(memoType, memoValue);
    if (memoIssue) issues.push(memoIssue);

    return {
      line: record.line,
      index: position + 1,
      // A rejected seed is dropped here and never reaches state or the DOM.
      destination: destinationIssue === "secret_key_destination" ? "" : rawDestination.trim(),
      amount,
      asset,
      memoType: memoType || null,
      memoValue: memoValue || null,
      issues,
      valid: issues.length === 0,
      duplicateOf: []
    };
  });

  markDuplicates(rows);

  const validCount = rows.filter((row) => row.valid).length;

  return ok({
    rows,
    totals: totalsByAsset(rows),
    validCount,
    invalidCount: rows.length - validCount,
    duplicateCount: rows.filter((row) => row.duplicateOf.length > 0).length,
    optionalColumns: headers.value.optionalColumns
  });
}

/**
 * Exports the validated rows, or refuses to.
 *
 * This is where `invalid_rows` earns its place: the export is the one action
 * that hands the file on to something else, and handing on a partially
 * validated payout list is how a bad row survives review. Everything stays
 * visible on screen; only the export is blocked.
 */
export function exportRows(report: PreflightReport): Result<string, PreflightErrorCode> {
  if (report.invalidCount > 0) return err("invalid_rows");

  return ok(
    JSON.stringify(
      {
        rowCount: report.rows.length,
        duplicateCount: report.duplicateCount,
        totals: report.totals.map((total) => ({
          asset: total.asset.key,
          total: total.total,
          rowCount: total.rowCount
        })),
        rows: report.rows.map((row) => ({
          line: row.line,
          destination: row.destination,
          amount: row.amount,
          asset: row.asset?.key ?? null,
          memoType: row.memoType,
          memoValue: row.memoValue,
          duplicateOf: row.duplicateOf
        }))
      },
      null,
      2
    )
  );
}
