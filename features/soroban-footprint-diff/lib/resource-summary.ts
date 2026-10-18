import type { ResourceSummaryData } from "@/features/soroban-footprint-diff/types";

export function summarizeResources(resources: ResourceSummaryData): {
  hasAny: boolean;
  rows: Array<{ label: string; value: string }>;
} {
  const rows: Array<{ label: string; value: string }> = [];
  if (resources.minResourceFee !== null) {
    rows.push({ label: "minResourceFee", value: resources.minResourceFee });
  }
  if (resources.cpuInsns !== null) {
    rows.push({ label: "cpuInsns", value: resources.cpuInsns });
  }
  if (resources.memBytes !== null) {
    rows.push({ label: "memBytes", value: resources.memBytes });
  }
  return { hasAny: rows.length > 0, rows };
}
