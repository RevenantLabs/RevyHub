import { describe, expect, it } from "vitest";
import { formatByteLength } from "@/features/scval-codec/lib/format";

describe("formatByteLength", () => {
  it("formats a single byte", () => {
    expect(formatByteLength("AA==")).toBe("1 byte");
  });

  it("formats multiple bytes", () => {
    expect(formatByteLength("AAAA")).toBe("3 bytes");
  });
});
