import type { MatrixRow } from "../types";
import { copy } from "../copy";
/** Horizon amounts have seven decimal places. Reject malformed data before arithmetic. */
export function toStroops(value: string): bigint {
  if (!/^(0|[1-9]\d*)(?:\.\d{1,7})?$/.test(value)) throw new Error("Invalid Horizon amount");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
}
export function fromStroops(value: bigint): string {
  const fraction = (value % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return `${value / 10_000_000n}${fraction ? `.${fraction}` : ""}`;
}
export function formatAmount(value: string): string {
  const [whole, fraction] = value.split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${fraction ? `.${fraction}` : ""}`;
}
export function assetLabel(row: MatrixRow): string {
  return row.kind === "native" ? copy.nativeLabel : row.code;
}
