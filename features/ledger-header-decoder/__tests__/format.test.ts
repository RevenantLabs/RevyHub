import { describe, expect, it } from "vitest";
import { formatCloseTime, formatStroops, formatUpgradeType } from "@/features/ledger-header-decoder/lib/format";

describe("display formatting", () => {
  it("formats Unix seconds in UTC", () => expect(formatCloseTime("1760000000")).toBe("2025-10-09 08:53:20 UTC"));
  it("preserves huge time points", () => expect(formatCloseTime("18446744073709551615")).toBe("18446744073709551615 UTC seconds"));
  it("keeps stroops as text", () => expect(formatStroops("5000000")).toBe("5000000 stroops"));
  it("identifies unknown upgrade types", () => expect(formatUpgradeType({ type: "unrecognized", typeNumber: 99, value: null, rawHex: "00000063" })).toBe("Unrecognized upgrade type (99)"));
});
