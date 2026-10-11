import { describe, expect, it } from "vitest";
import {
  formatCursorDisplay,
  formatLinkRel,
  formatPagingToken,
  formatRecordCount,
  toJsonSummary
} from "@/features/horizon-pagination-inspector/lib/format";
import type { HorizonPaginationReport } from "@/features/horizon-pagination-inspector/types";

describe("format helpers", () => {
  it("formats record count with locale separators", () => {
    expect(formatRecordCount(0)).toBe("0");
    expect(formatRecordCount(1500)).toBe("1,500");
  });

  it("formats link relationships with descriptive labels", () => {
    expect(formatLinkRel("self")).toBe("Current page (self)");
    expect(formatLinkRel("next")).toBe("Next page (next)");
    expect(formatLinkRel("prev")).toBe("Previous page (prev)");
    expect(formatLinkRel("transactions")).toBe("Link (transactions)");
  });

  it("formats cursor display with fallback", () => {
    expect(formatCursorDisplay("cursor-123")).toBe("cursor-123");
    expect(formatCursorDisplay(null)).toBe("None (omitted)");
  });

  it("formats paging tokens with fallback", () => {
    expect(formatPagingToken("token-abc")).toBe("token-abc");
    expect(formatPagingToken(null)).toBe("Missing paging token");
  });

  it("serializes report to deterministic JSON summary", () => {
    const mockReport: HorizonPaginationReport = {
      recordCount: 1,
      records: [
        {
          index: 0,
          id: "rec-1",
          pagingToken: "token-1",
          missingId: false,
          missingToken: false,
          duplicateId: false,
          duplicateToken: false
        }
      ],
      uniqueIdCount: 1,
      duplicateIdCount: 0,
      duplicateIds: [],
      missingIdCount: 0,
      uniqueTokenCount: 1,
      duplicateTokenCount: 0,
      duplicateTokens: [],
      missingTokenCount: 0,
      hasAnomalies: false,
      selfLink: {
        rel: "self",
        href: "https://horizon.stellar.org/records",
        templated: false,
        scheme: "https:",
        isValidHttp: true,
        isHostileScheme: false,
        origin: "https://horizon.stellar.org",
        endpointPath: "/records",
        cursor: null,
        order: null,
        limit: null,
        isOffOrigin: false
      },
      nextLink: null,
      prevLink: null,
      otherLinks: [],
      hasOffOriginLinks: false,
      expectedOrigin: null,
      isSinglePageObservation: true
    };

    const json = toJsonSummary(mockReport);
    const parsed = JSON.parse(json);
    expect(parsed.recordCount).toBe(1);
    expect(parsed.links.self.href).toBe("https://horizon.stellar.org/records");
  });
});
