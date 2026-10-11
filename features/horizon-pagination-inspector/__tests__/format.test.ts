import { describe, it, expect } from "vitest";
import { formatCursor, formatCount, formatBoolean } from "@/features/horizon-pagination-inspector/lib/format";

describe("formatCursor", () => {
  it("returns dash for undefined", () => {
    expect(formatCursor(undefined)).toBe("—");
  });
  it("truncates long cursors", () => {
    const long = "a".repeat(50);
    expect(formatCursor(long)).toContain("...");
  });
  it("shows short cursors as-is", () => {
    expect(formatCursor("abc123")).toBe("abc123");
  });
});

describe("formatCount", () => {
  it("formats thousands", () => {
    expect(formatCount(1234)).toBe("1,234");
  });
});

describe("formatBoolean", () => {
  it("formats true", () => {
    expect(formatBoolean(true)).toBe("Yes");
  });
  it("formats false", () => {
    expect(formatBoolean(false)).toBe("No");
  });
});
