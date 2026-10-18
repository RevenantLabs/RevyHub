import { copy } from "../copy";
import type { MultiAccountAssetExposureResult } from "../types";
export function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
/** Exact public amounts, stable input columns and sorted matrix rows. */
export function exportExposureCsv(result: MultiAccountAssetExposureResult): string {
  const lines = [
    [copy.csvAssetType, copy.csvAssetCode, copy.csvIssuer, ...result.accounts.map((row) => row.accountId), copy.csvTotal],
    [copy.csvStatus, "", "", ...result.accounts.map((row) => row.status === "success" ? copy.csvSuccess : row.code), ""],
    ...result.matrix.map((row) => [row.kind, row.code, row.issuer, ...row.balances.map((amount) => amount ?? ""), row.total])
  ];
  return lines.map((line) => line.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
