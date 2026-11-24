import { describe, expect, it } from "vitest";
import { classifyExpiry } from "../lib/expiry-readiness";

describe("classifyExpiry", () => {
  it("treats the expiration ledger itself as still valid (inclusive boundary)", () => {
    expect(classifyExpiry(100, 99)).toBe("ready");
    expect(classifyExpiry(100, 100)).toBe("ready");
    expect(classifyExpiry(100, 101)).toBe("expired");
  });

  it("handles the uint32 extremes exactly", () => {
    expect(classifyExpiry(0, 0)).toBe("ready");
    expect(classifyExpiry(0, 1)).toBe("expired");
    expect(classifyExpiry(0xffffffff, 0xffffffff)).toBe("ready");
  });

  it("returns unknown without an evaluation ledger instead of guessing", () => {
    expect(classifyExpiry(100, null)).toBe("unknown");
    expect(classifyExpiry(0, null)).toBe("unknown");
  });

  it("rejects malformed direct inputs", () => {
    expect(() => classifyExpiry(-1, 1)).toThrow(RangeError);
    expect(() => classifyExpiry(1.5, 1)).toThrow(RangeError);
    expect(() => classifyExpiry(1, 2 ** 32)).toThrow(RangeError);
    expect(() => classifyExpiry(1, Number.NaN)).toThrow(RangeError);
  });
});
