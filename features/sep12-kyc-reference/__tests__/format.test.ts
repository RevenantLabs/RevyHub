import { describe, it, expect } from "vitest";
import { formatFieldType, formatCategory, formatRequired, formatExamples } from "@/features/sep12-kyc-reference/lib/format";

describe("formatFieldType", () => {
  it("formats string type", () => {
    expect(formatFieldType("string")).toBe("String");
  });
  it("formats binary type", () => {
    expect(formatFieldType("binary")).toBe("Binary (file)");
  });
  it("handles unknown type", () => {
    expect(formatFieldType("unknown")).toBe("unknown");
  });
});

describe("formatCategory", () => {
  it("formats personal", () => {
    expect(formatCategory("personal")).toBe("Personal");
  });
  it("formats entity", () => {
    expect(formatCategory("entity")).toBe("Entity");
  });
});

describe("formatRequired", () => {
  it("formats true as Yes", () => {
    expect(formatRequired(true)).toBe("Yes");
  });
  it("formats false as No", () => {
    expect(formatRequired(false)).toBe("No");
  });
});

describe("formatExamples", () => {
  it("formats array of examples", () => {
    expect(formatExamples(["a", "b"])).toBe("a, b");
  });
  it("returns dash for empty", () => {
    expect(formatExamples([])).toBe("—");
  });
  it("returns dash for undefined", () => {
    expect(formatExamples(undefined)).toBe("—");
  });
});
