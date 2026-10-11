/** Error codes produced by the horizon-pagination-inspector slice. */
export type HorizonPaginationInspectorErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_json"
  | "invalid_collection";

/** Parsed and validated input accepted by the inspector logic. */
export interface HorizonPaginationInspectorInput {
  collectionText: string;
  expectedOrigin: string | null;
}

/** Raw form input before validation. */
export interface RawHorizonPaginationInput {
  collection: string;
  expectedOrigin: string;
}

/** Record identification and paging metadata audit. */
export interface RecordInspection {
  index: number;
  id: string | null;
  pagingToken: string | null;
  missingId: boolean;
  missingToken: boolean;
  duplicateId: boolean;
  duplicateToken: boolean;
}

/** Structured breakdown of a HAL link. */
export interface ParsedLink {
  rel: "self" | "next" | "prev" | string;
  href: string;
  templated: boolean;
  scheme: string | null;
  isValidHttp: boolean;
  isHostileScheme: boolean;
  origin: string | null;
  endpointPath: string | null;
  cursor: string | null;
  order: string | null;
  limit: string | null;
  isOffOrigin: boolean;
}

/** Comprehensive offline diagnostic report for a Horizon collection envelope. */
export interface HorizonPaginationReport {
  recordCount: number;
  records: RecordInspection[];
  uniqueIdCount: number;
  duplicateIdCount: number;
  duplicateIds: string[];
  missingIdCount: number;
  uniqueTokenCount: number;
  duplicateTokenCount: number;
  duplicateTokens: string[];
  missingTokenCount: number;
  hasAnomalies: boolean;
  selfLink: ParsedLink | null;
  nextLink: ParsedLink | null;
  prevLink: ParsedLink | null;
  otherLinks: ParsedLink[];
  hasOffOriginLinks: boolean;
  expectedOrigin: string | null;
  isSinglePageObservation: boolean;
}
