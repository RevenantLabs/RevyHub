import type { Report } from "../types";
/** Stable key ordering makes repeated local exports byte-identical. */
export function stableJson(value: unknown): string {
 const normalize = (v: unknown): unknown => {
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v)) return v.map(normalize);
  if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,normalize(x)]));
  return v;
 };
 return JSON.stringify(normalize(value),null,2);
}
export function formatReport(report:Report):string {return stableJson(report.export ?? report);}
