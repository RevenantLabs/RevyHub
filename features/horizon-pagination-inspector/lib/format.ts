import type {
  LinkSummary,
  PaginationInspection,
  TokenOrder
} from "@/features/horizon-pagination-inspector/types";

const ORDER_LABELS: Record<TokenOrder, string> = {
  increasing: "Increasing in page order",
  not_increasing: "Not increasing in page order",
  undetermined: "Cannot be established from this page",
  none: "No numeric paging tokens on this page"
};

export function formatRecordCount(count: number): string {
  return count === 1 ? "1 record" : String(count) + " records";
}

export function formatTokenOrder(order: TokenOrder): string {
  return ORDER_LABELS[order];
}

/** Renders a link as its href, or a caller-supplied label when absent. */
export function formatLink(link: LinkSummary | null, absentLabel: string): string {
  return link ? link.href : absentLabel;
}

export function formatCursor(link: LinkSummary | null, absentLabel: string): string {
  return link && link.cursor !== null ? link.cursor : absentLabel;
}

/** Formats zero-based record positions as one-based, comma-separated text. */
export function formatIndexes(indexes: number[]): string {
  if (indexes.length === 0) return "";
  return indexes.map((index) => "#" + String(index + 1)).join(", ");
}

export function formatDuplicates(duplicates: PaginationInspection["duplicates"]): string {
  if (duplicates.length === 0) return "";

  return duplicates
    .map((entry) => entry.key + " at " + formatIndexes(entry.indexes))
    .join("; ");
}

/**
 * Whether this response is evidence of a trailing page.
 *
 * Only the presence of a next link counts. Page length is not consulted at
 * all, deliberately: Horizon returns short pages for reasons unrelated to the
 * end of a collection, so "fewer records than the page limit" is not a paging
 * signal and must never be presented as one.
 */
export function hasNextPageEvidence(inspection: PaginationInspection): boolean {
  return inspection.next !== null;
}

/**
 * Whether this response is *conclusive* about reaching the end.
 *
 * A response with no _links object carries no paging information, so it proves
 * nothing either way; only a present links object with no next link does.
 */
export function isConclusiveAboutEnd(inspection: PaginationInspection): boolean {
  return inspection.hasLinksObject && inspection.next === null;
}
