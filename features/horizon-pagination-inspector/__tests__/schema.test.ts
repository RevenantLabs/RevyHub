import { describe, it, expect } from "vitest";
import { parseHorizonPaginationInput } from "@/features/horizon-pagination-inspector/schema";

describe("parseHorizonPaginationInput", () => {
  it("accepts JSON input", () => {
    const result = parseHorizonPaginationInput('{"_links": {}}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("json");
    }
  });

  it("accepts URL input", () => {
    const result = parseHorizonPaginationInput("https://horizon.stellar.org/offers");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("url");
    }
  });

  it("accepts Link header input", () => {
    const result = parseHorizonPaginationInput('</offers?cursor=abc>; rel="next"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("link");
    }
  });

  it("rejects empty input", () => {
    expect(parseHorizonPaginationInput("").ok).toBe(false);
    expect(parseHorizonPaginationInput("   ").ok).toBe(false);
  });
});
