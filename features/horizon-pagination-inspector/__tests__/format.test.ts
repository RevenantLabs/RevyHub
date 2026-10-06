import { describe, expect, it } from "vitest";
import {
  formatCursor,
  formatDuplicates,
  formatIndexes,
  formatLink,
  formatRecordCount,
  formatTokenOrder,
  hasNextPageEvidence,
  isConclusiveAboutEnd
} from "@/features/horizon-pagination-inspector/lib/format";
import type { PaginationInspection } from "@/features/horizon-pagination-inspector/types";

const inspection = (overrides: Partial<PaginationInspection> = {}): PaginationInspection => ({
  recordCount: 1,
  hasLinksObject: true,
  next: null,
  prev: null,
  missingIdentifiers: [],
  nonNumericTokens: [],
  duplicates: [],
  tokenOrder: "none",
  ...overrides
});

describe("formatRecordCount", () => {
  it("pluralises only when it should", () => {
    expect(formatRecordCount(0)).toBe("0 records");
    expect(formatRecordCount(1)).toBe("1 record");
    expect(formatRecordCount(2)).toBe("2 records");
  });
});

describe("formatTokenOrder", () => {
  it("maps every order to text that says what it means", () => {
    expect(formatTokenOrder("increasing")).toMatch(/Increasing/);
    expect(formatTokenOrder("not_increasing")).toMatch(/Not increasing/);
    expect(formatTokenOrder("undetermined")).toMatch(/Cannot be established/);
    expect(formatTokenOrder("none")).toMatch(/No numeric/);
  });
});

describe("formatLink and formatCursor", () => {
  it("falls back to the supplied label when a link is absent", () => {
    expect(formatLink(null, "absent")).toBe("absent");
    expect(formatCursor(null, "absent")).toBe("absent");
  });

  it("falls back when a link exists but its cursor does not", () => {
    expect(formatCursor({ href: "/payments", cursor: null, params: [] }, "absent")).toBe("absent");
  });
});

describe("formatIndexes", () => {
  it("renders positions as one-based labels", () => {
    expect(formatIndexes([0, 2])).toBe("#1, #3");
  });

  it("renders nothing when there is nothing to report", () => {
    expect(formatIndexes([])).toBe("");
  });
});

describe("formatDuplicates", () => {
  it("names the identifier and every position it appeared at", () => {
    expect(formatDuplicates([{ key: "abc", indexes: [0, 1] }])).toBe("abc at #1, #2");
  });

  it("renders nothing when there are no duplicates", () => {
    expect(formatDuplicates([])).toBe("");
  });
});

describe("paging evidence", () => {
  it("does not infer a next page from a short page", () => {
    expect(hasNextPageEvidence(inspection({ recordCount: 1 }))).toBe(false);
  });

  it("treats a present next link as evidence of more pages", () => {
    const withNext = inspection({
      next: { href: "/payments?cursor=1", cursor: "1", params: [] }
    });
    expect(hasNextPageEvidence(withNext)).toBe(true);
    expect(isConclusiveAboutEnd(withNext)).toBe(false);
  });

  it("only calls an ending conclusive when links were actually present", () => {
    expect(isConclusiveAboutEnd(inspection({ hasLinksObject: true, next: null }))).toBe(true);
    expect(isConclusiveAboutEnd(inspection({ hasLinksObject: false, next: null }))).toBe(false);
  });
});
