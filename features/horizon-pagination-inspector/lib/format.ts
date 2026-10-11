import type { HorizonPaginationReport } from "@/features/horizon-pagination-inspector/types";

/** Formats a numeric count into a readable string. */
export function formatRecordCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

/** Formats a link relationship into a capitalized display label. */
export function formatLinkRel(rel: string): string {
  switch (rel) {
    case "self":
      return "Current page (self)";
    case "next":
      return "Next page (next)";
    case "prev":
      return "Previous page (prev)";
    default:
      return `Link (${rel})`;
  }
}

/** Formats an opaque cursor value or provides a missing indicator. */
export function formatCursorDisplay(cursor: string | null): string {
  if (!cursor) {
    return "None (omitted)";
  }
  return cursor;
}

/** Formats a paging token or indicates missing metadata. */
export function formatPagingToken(token: string | null): string {
  if (!token) {
    return "Missing paging token";
  }
  return token;
}

/** Serializes a HorizonPaginationReport into deterministic formatted JSON for export. */
export function toJsonSummary(report: HorizonPaginationReport): string {
  return JSON.stringify(
    {
      recordCount: report.recordCount,
      uniqueIdCount: report.uniqueIdCount,
      duplicateIdCount: report.duplicateIdCount,
      duplicateIds: report.duplicateIds,
      missingIdCount: report.missingIdCount,
      uniqueTokenCount: report.uniqueTokenCount,
      duplicateTokenCount: report.duplicateTokenCount,
      duplicateTokens: report.duplicateTokens,
      missingTokenCount: report.missingTokenCount,
      hasAnomalies: report.hasAnomalies,
      expectedOrigin: report.expectedOrigin,
      hasOffOriginLinks: report.hasOffOriginLinks,
      links: {
        self: report.selfLink,
        next: report.nextLink,
        prev: report.prevLink,
        other: report.otherLinks
      },
      records: report.records
    },
    null,
    2
  );
}
