import { describe, expect, it } from "vitest";
import {
  formatByteCount,
  formatHexBytes,
  formatMemoValue
} from "@/features/memo-inspector/lib/format";
import { TEXT_MAX_BYTES } from "@/features/memo-inspector/lib/memoInspector";

describe("formatByteCount", () => {
  it("reports a bare count when there is no limit", () => {
    expect(formatByteCount(36)).toBe("36 bytes");
  });

  it("uses the singular for one byte, but not for a budget", () => {
    expect(formatByteCount(1)).toBe("1 byte");
    expect(formatByteCount(1, TEXT_MAX_BYTES)).toBe("1 / 28 bytes");
  });

  it("reports zero in the plural", () => {
    expect(formatByteCount(0, TEXT_MAX_BYTES)).toBe("0 / 28 bytes");
  });

  it("shows the budget while the value fits", () => {
    expect(formatByteCount(12, TEXT_MAX_BYTES)).toBe("12 / 28 bytes");
    expect(formatByteCount(28, TEXT_MAX_BYTES)).toBe("28 / 28 bytes");
  });

  it("spells out the overshoot once the limit is passed", () => {
    expect(formatByteCount(40, TEXT_MAX_BYTES)).toBe("40 / 28 bytes — 12 over");
    expect(formatByteCount(29, TEXT_MAX_BYTES)).toBe("29 / 28 bytes — 1 over");
  });
});

describe("formatHexBytes", () => {
  it("groups hex into byte pairs so bytes can be counted", () => {
    expect(formatHexBytes("00000001")).toBe("00 00 00 01");
    expect(formatHexBytes("ff")).toBe("ff");
  });

  it("returns an empty string for empty hex", () => {
    expect(formatHexBytes("")).toBe("");
  });
});

describe("formatMemoValue", () => {
  it("falls back when there is no value", () => {
    expect(formatMemoValue(null, "None")).toBe("None");
    expect(formatMemoValue("", "None")).toBe("None");
  });

  it("passes a real value straight through", () => {
    expect(formatMemoValue("Invoice 1001", "None")).toBe("Invoice 1001");
  });
});
