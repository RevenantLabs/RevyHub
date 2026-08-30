import { describe, expect, it } from "vitest";
import { formatByteCount, formatHex } from "@/features/account-data-entries/lib/format";

describe("formatHex", () => {
  it("groups a compact hex string into bytes", () => {
    expect(formatHex("00ff107f")).toBe("00 ff 10 7f");
  });

  it("keeps an empty byte sequence empty", () => {
    expect(formatHex("")).toBe("");
  });
});

describe("formatByteCount", () => {
  it("pluralises the byte count", () => {
    expect(formatByteCount(1)).toBe("1 byte");
    expect(formatByteCount(4)).toBe("4 bytes");
  });
});
