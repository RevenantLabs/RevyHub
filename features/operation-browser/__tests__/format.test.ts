import { describe, expect, it } from "vitest";
import {
  extractOperationParams,
  filterOperations,
  formatFilterSummary,
  formatOperationType,
  formatTimestamp,
  flattenLoadedOperations
} from "@/features/operation-browser/lib/format";
import {
  multiPageFixture,
  pageOneRecords
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

describe("formatOperationType", () => {
  it("labels known operation types", () => {
    expect(formatOperationType("change_trust")).toBe("Change trust");
  });
});

describe("formatTimestamp", () => {
  it("renders UTC timestamps consistently", () => {
    expect(formatTimestamp("2024-01-15T12:00:00.000Z")).toBe("2024-01-15 12:00:00 UTC");
  });
});

describe("extractOperationParams", () => {
  it("describes manage sell offers in plain language", () => {
    const params = extractOperationParams(pageOneRecords[2]!);
    expect(params.some((param) => param.label === "Price")).toBe(true);
  });

  it("falls back to readable fields for unknown types", () => {
    const params = extractOperationParams({
      id: "1",
      paging_token: "1",
      type: "future_protocol_op",
      source_account: "GABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "abc",
      transaction_successful: true,
      custom_field: "value"
    });
    expect(params.some((param) => param.label === "Custom Field")).toBe(true);
  });
});

describe("filterOperations", () => {
  it("filters loaded rows by type", () => {
    const loaded = flattenLoadedOperations(multiPageFixture.pages);
    expect(filterOperations(loaded, "payment")).toHaveLength(19);
  });
});

describe("formatFilterSummary", () => {
  it("reports how many loaded rows matched the filter", () => {
    expect(formatFilterSummary(2, 4, "payment")).toBe("2 of 4 loaded operations match Payment");
  });
});
