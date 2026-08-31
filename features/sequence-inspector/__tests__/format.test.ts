import { describe, expect, it } from "vitest";
import {
  formatBitPart,
  formatIncrease,
  formatSequence
} from "@/features/sequence-inspector/lib/format";

describe("sequence formatting", () => {
  it("renders values above Number.MAX_SAFE_INTEGER as exact decimal digits", () => {
    expect(formatSequence(9_223_372_036_854_775_807n)).toBe("9223372036854775807");
  });

  it("shows a bit field in decimal and zero-padded hexadecimal", () => {
    expect(formatBitPart(15n)).toBe("15 (0x0000000f)");
  });

  it("marks a bump delta as an increase", () => {
    expect(formatIncrease(12345n)).toBe("+12345");
  });
});
