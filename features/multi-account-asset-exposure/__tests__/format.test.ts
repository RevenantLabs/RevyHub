import { describe, expect, it } from "vitest";
import { assetLabel, formatAmount, fromStroops, toStroops } from "../lib/format";
describe("exact amount formatting", () => {
  it("round trips the largest signed 64-bit Stellar amount", () => {
    expect(fromStroops(toStroops("922337203685.4775807"))).toBe("922337203685.4775807");
    expect(formatAmount("922337203685.4775807")).toBe("922,337,203,685.4775807");
  });
  it("rejects excess precision and malformed amounts", () => {
    expect(() => toStroops("1.00000001")).toThrow();
    expect(() => toStroops("1e9")).toThrow();
  });
  it("labels native XLM separately", () => {
    expect(assetLabel({ kind: "native", code: "XLM", issuer: "", balances: [], total: "1" })).toBe("XLM (native)");
  });
});
