import { expect, it } from "vitest";
import { formatFilter, formatLedgerPair, stableJson } from "../lib/format";

it("prints filters with sorted keys and an en dash between ledgers", () => {
  expect(stableJson({ z: 1n, a: 1 })).toBe(stableJson({ a: 1, z: "1" }));
  expect(formatLedgerPair("100", "500")).toBe("100–500");
  const printed = formatFilter({
    filter: { startLedger: 150, filters: [{ contractIds: ["C"] }], pagination: { limit: 10 } }
  });
  expect(printed).toContain('"startLedger": 150');
  expect(printed.indexOf("filters")).toBeLessThan(printed.indexOf("startLedger"));
});
