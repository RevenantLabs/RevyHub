import { describe, expect, it } from "vitest";
import { formatDetected, formatFieldCount } from "@/features/txrep-converter/lib/format";

describe("format", () => {
  it("names the detected format exactly", () => {
    expect(formatDetected("xdr")).toBe("Base64 XDR");
    expect(formatDetected("txrep")).toBe("Txrep");
  });

  it("pluralizes the field count", () => {
    expect(formatFieldCount(1)).toBe("1 field");
    expect(formatFieldCount(12)).toBe("12 fields");
  });
});
