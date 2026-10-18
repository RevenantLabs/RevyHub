export type AccessMode = "read_only" | "read_write" | "conflict";

export interface FootprintKey {
  id: string;
  label: string;
  mode: AccessMode;
}

export interface AccessChange {
  id: string;
  label: string;
  before: AccessMode | null;
  after: AccessMode | null;
  kind: "added" | "removed" | "mode_changed" | "unchanged";
}

export interface ResourceSummaryData {
  minResourceFee: string | null;
  cpuInsns: string | null;
  memBytes: string | null;
  labeledAsSimulation: true;
}

export interface ParsedFootprint {
  keys: FootprintKey[];
  resources: ResourceSummaryData;
}

export interface SorobanFootprintDiffInput {
  firstResult: string;
  secondResult: string;
}

export interface SorobanFootprintDiffResult {
  added: FootprintKey[];
  removed: FootprintKey[];
  modeChanges: AccessChange[];
  unchanged: FootprintKey[];
  firstResources: ResourceSummaryData;
  secondResources: ResourceSummaryData;
  disclaimer: string;
}

export type SorobanFootprintDiffErrorCode =
  | "empty_first_result"
  | "empty_second_result"
  | "invalid_json"
  | "invalid_footprint_xdr"
  | "too_large";

export const MAX_INPUT_CHARS = 100_000;
