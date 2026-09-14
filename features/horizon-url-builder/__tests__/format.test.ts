import { describe, it, expect } from "vitest";
import { truncateUrl } from "@/features/horizon-url-builder/lib/format";

describe("truncateUrl", () => {
  it("truncates long URLs", () => {
    const long = "https://example.com/" + "a".repeat(100);
    expect(truncateUrl(long)).toContain("...");
  });
  it("keeps short URLs", () => {
    expect(truncateUrl("https://a.co")).toBe("https://a.co");
  });
});
