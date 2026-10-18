import { truncateMiddle } from "@/core/lib/strings";
import { copy, errorCopy, rowIssueCopy } from "@/features/payment-csv-preflight/copy";
import type {
  AssetIdentity,
  AssetTotal,
  PaymentRow,
  PreflightErrorCode,
  PreflightReport,
  RowFilter,
  RowIssueCode
} from "@/features/payment-csv-preflight/types";

/**
 * Formats an amount without going through `Number`.
 *
 * Grouping is applied to the whole part as text and trailing zeros are
 * trimmed, so a total stays exact no matter how far past the safe integer
 * range it goes.
 */
export function formatAmount(value: string): string {
  const [whole, fraction = ""] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

/** Names an asset by code *and* issuer, so two assets never look like one. */
export function formatAssetLabel(asset: AssetIdentity | null): string {
  if (!asset) return copy.assetUnresolved;
  if (asset.isNative) return copy.assetNative;
  return `${asset.code} · ${truncateMiddle(asset.issuer ?? "", 4)}`;
}

export function formatOverview(report: PreflightReport): string {
  return copy.overview(report.validCount, report.invalidCount, report.duplicateCount);
}

/** Joins a row's issues into one piece of advice, in the order they were found. */
export function formatRowAdvice(issues: readonly RowIssueCode[]): string {
  if (!issues.length) return copy.rowValid;
  return issues.map((issue) => rowIssueCopy[issue]).join(" ");
}

export function formatDuplicateLines(lines: readonly number[]): string {
  return copy.duplicateLines([...lines]);
}

export function formatOptionalColumns(columns: readonly string[]): string {
  if (!columns.length) return copy.summaryOptionalColumnsNone;
  return [...columns].join(", ");
}

/**
 * Adds the line reference a malformed-CSV error carries.
 *
 * The parser reports where a record *began*, which is the only number a user
 * can act on when a quoted value ran over several lines.
 */
export function describeError(code: PreflightErrorCode, detail?: unknown): string {
  const base = errorCopy[code].description;
  if (typeof detail !== "number") return base;
  return `${base} The first problem is at line ${detail}.`;
}

export function filterRows(rows: readonly PaymentRow[], filter: RowFilter): PaymentRow[] {
  if (filter === "valid") return rows.filter((row) => row.valid);
  if (filter === "invalid") return rows.filter((row) => !row.valid);
  return [...rows];
}

/** True when one asset code appears under more than one issuer in the file. */
export function hasAmbiguousAssetCodes(totals: readonly AssetTotal[]): boolean {
  const codes = new Set<string>();

  for (const total of totals) {
    if (codes.has(total.asset.code)) return true;
    codes.add(total.asset.code);
  }

  return false;
}
