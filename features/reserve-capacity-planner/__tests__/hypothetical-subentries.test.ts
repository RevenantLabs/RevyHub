import { describe, expect, it } from "vitest";
import { parseHypotheticalCount, subentryTotal } from "@/features/reserve-capacity-planner/lib/hypothetical-subentries";

describe("hypothetical subentries", () => {
  it("sums the four counts and does not add a master key", () => {
    expect(subentryTotal({ trustlines: 1n, offers: 2n, dataEntries: 3n, signers: 4n })).toBe(10n);
    expect(subentryTotal({ trustlines: 0n, offers: 0n, dataEntries: 0n, signers: 0n })).toBe(0n);
  });

  it("accepts a trimmed non-negative integer", () => {
    const parsed = parseHypotheticalCount(" 12 ");
    expect(parsed.ok && parsed.value).toBe(12n);
    expect(parseHypotheticalCount("0")).toEqual({ ok: true, value: 0n });
  });

  it("rejects negatives, fractions, exponents and oversized counts", () => {
    expect(parseHypotheticalCount("-1")).toEqual({ ok: false, code: "invalid_count" });
    expect(parseHypotheticalCount("1.0")).toEqual({ ok: false, code: "invalid_count" });
    expect(parseHypotheticalCount("1e2")).toEqual({ ok: false, code: "invalid_count" });
    expect(parseHypotheticalCount("")).toEqual({ ok: false, code: "invalid_count" });
    expect(parseHypotheticalCount("1".repeat(16))).toEqual({ ok: false, code: "invalid_count" });
    expect(parseHypotheticalCount("1".repeat(15)).ok).toBe(true);
  });
});
