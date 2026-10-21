import { copy } from "@/features/txrep-converter/copy";
import type { DetectedFormat } from "@/features/txrep-converter/lib/format-detect";

export function formatDetected(format: DetectedFormat): string {
  return format === "xdr" ? copy.xdrLabel : copy.txrepLabel;
}

export function formatFieldCount(count: number): string {
  return count === 1 ? "1 field" : `${count} fields`;
}
