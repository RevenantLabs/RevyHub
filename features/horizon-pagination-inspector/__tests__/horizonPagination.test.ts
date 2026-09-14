import { describe, it, expect } from "vitest";
import { parseHorizonResponse, buildPaginatedUrl } from "@/features/horizon-pagination-inspector/lib/horizonPagination";
import { sampleHorizonResponse, sampleLinkHeader } from "@/features/horizon-pagination-inspector/fixtures/horizonPagination.fixture";

describe("parseHorizonResponse", () => {
  it("parses JSON response", () => {
    const result = parseHorizonResponse(JSON.stringify(sampleHorizonResponse));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.records).toBe(3);
      expect(result.value.hasNextPage).toBe(true);
      expect(result.value.hasPrevPage).toBe(true);
      expect(result.value.nextCursor).toBeTruthy();
    }
  });

  it("parses URL with cursor", () => {
    const result = parseHorizonResponse("https://horizon.stellar.org/offers?cursor=abc123&limit=20");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nextCursor).toBe("abc123");
      expect(result.value.hasNextPage).toBe(true);
    }
  });

  it("parses Link header", () => {
    const result = parseHorizonResponse(sampleLinkHeader);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hasNextPage).toBe(true);
      expect(result.value.hasPrevPage).toBe(true);
    }
  });

  it("rejects empty input", () => {
    expect(parseHorizonResponse("").ok).toBe(false);
    expect(parseHorizonResponse("   ").ok).toBe(false);
  });

  it("rejects invalid input", () => {
    expect(parseHorizonResponse("not-json-or-url").ok).toBe(false);
  });

  it("rejects malformed JSON", () => {
    expect(parseHorizonResponse("{invalid json}").ok).toBe(false);
  });
});

describe("buildPaginatedUrl", () => {
  it("builds URL with cursor", () => {
    const url = buildPaginatedUrl("https://horizon.stellar.org/offers", "abc123", 20);
    expect(url).toContain("cursor=abc123");
    expect(url).toContain("limit=20");
  });

  it("builds URL without cursor", () => {
    const url = buildPaginatedUrl("https://horizon.stellar.org/offers");
    expect(url).not.toContain("cursor");
  });
});
