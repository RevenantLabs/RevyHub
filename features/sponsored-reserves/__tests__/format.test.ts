import { describe, expect, it } from "vitest";
import {
  formatEntryReference,
  formatStroops,
  reserveEffectDirection,
  summarizeSponsoredEntries
} from "@/features/sponsored-reserves/lib/format";

describe("formatStroops", () => {
  it("formats whole and fractional XLM exactly", () => {
    expect(formatStroops("5000000")).toBe("0.5");
    expect(formatStroops("10000000")).toBe("1");
  });

  it("keeps precision beyond Number.MAX_SAFE_INTEGER", () => {
    expect(formatStroops("9223372036854775807")).toBe("922337203685.4775807");
  });

  it("formats signed reserve effects", () => {
    expect(formatStroops("10000000", true)).toBe("+1");
    expect(formatStroops("-2500000", true)).toBe("-0.25");
    expect(formatStroops("0", true)).toBe("0");
  });
});

describe("formatEntryReference", () => {
  it("prefixes offer IDs without changing other references", () => {
    expect(
      formatEntryReference({ id: "offer:42", kind: "offer", reference: "42", sponsor: "G" })
    ).toBe("#42");
    expect(
      formatEntryReference({ id: "data:name", kind: "data", reference: "name", sponsor: "G" })
    ).toBe("name");
  });
});

describe("summarizeSponsoredEntries", () => {
  it("counts entries in table order and omits kinds with no entries", () => {
    expect(
      summarizeSponsoredEntries([
        { id: "offer:1", kind: "offer", reference: "1", sponsor: "G" },
        { id: "account:G", kind: "account", reference: "G", sponsor: "G" },
        { id: "offer:2", kind: "offer", reference: "2", sponsor: "G" },
        { id: "data:name", kind: "data", reference: "name", sponsor: "G" }
      ])
    ).toEqual([
      { kind: "account", count: 1 },
      { kind: "offer", count: 2 },
      { kind: "data", count: 1 }
    ]);
  });

  it("returns no summary items when there are no entries", () => {
    expect(summarizeSponsoredEntries([])).toEqual([]);
  });
});

describe("reserveEffectDirection", () => {
  it("distinguishes relief, burden and a neutral effect", () => {
    expect(reserveEffectDirection("1")).toBe("relief");
    expect(reserveEffectDirection("-1")).toBe("burden");
    expect(reserveEffectDirection("0")).toBe("neutral");
  });
});
