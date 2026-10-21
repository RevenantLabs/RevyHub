import { describe, expect, it } from "vitest";
import { formatArgCount, shortenHex } from "../lib/format";

describe("shortenHex", () => {
  it("shortens a long hex string", () => {
    expect(shortenHex("a".repeat(64), 6)).toBe("aaaaaa...aaaaaa");
  });

  it("leaves a short string unchanged", () => {
    expect(shortenHex("abcd", 6)).toBe("abcd");
  });
});

describe("formatArgCount", () => {
  it("handles zero, singular and plural", () => {
    expect(formatArgCount(0)).toBe("No constructor arguments");
    expect(formatArgCount(1)).toBe("1 constructor argument");
    expect(formatArgCount(3)).toBe("3 constructor arguments");
  });
});
