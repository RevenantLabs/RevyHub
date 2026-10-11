import { describe, it, expect } from "vitest";
import { parseSep12SearchInput } from "@/features/sep12-kyc-reference/schema";

describe("parseSep12SearchInput", () => {
  it("accepts empty query", () => {
    const result = parseSep12SearchInput("");
    expect(result.ok).toBe(true);
  });

  it("accepts valid query", () => {
    const result = parseSep12SearchInput("first_name");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.query).toBe("first_name");
    }
  });

  it("accepts valid category", () => {
    const result = parseSep12SearchInput("", "personal");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.category).toBe("personal");
    }
  });

  it("rejects invalid category", () => {
    const result = parseSep12SearchInput("", "invalid_category");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_filter");
    }
  });

  it("trims whitespace from query", () => {
    const result = parseSep12SearchInput("  first_name  ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.query).toBe("first_name");
    }
  });
});
