import { describe, expect, it } from "vitest";
import { parseLedgerProtocolTransitionMapInput } from "@/features/ledger-protocol-transition-map/schema";
import { COUNT_MAX, COUNT_MIN } from "@/features/ledger-protocol-transition-map/types";

describe("parseLedgerProtocolTransitionMapInput", () => {
  it("accepts a valid start ledger and count", () => {
    expect(
      parseLedgerProtocolTransitionMapInput({ startLedger: "1000", count: "20" })
    ).toEqual({ ok: true, value: { startLedger: 1000n, count: 20 } });
  });

  it.each(["", "0", "-1", "abc"])("rejects invalid start ledger %j", (startLedger) => {
    expect(parseLedgerProtocolTransitionMapInput({ startLedger, count: "20" })).toEqual({
      ok: false,
      code: "invalid_start_ledger"
    });
  });

  it.each(["", "1", String(COUNT_MAX + 1), "2.5", "nope"])(
    "rejects invalid count %j",
    (count) => {
      expect(parseLedgerProtocolTransitionMapInput({ startLedger: "1000", count })).toEqual({
        ok: false,
        code: "invalid_count"
      });
    }
  );

  it("accepts count boundaries", () => {
    expect(
      parseLedgerProtocolTransitionMapInput({
        startLedger: "1",
        count: String(COUNT_MIN)
      }).ok
    ).toBe(true);
    expect(
      parseLedgerProtocolTransitionMapInput({
        startLedger: "1",
        count: String(COUNT_MAX)
      }).ok
    ).toBe(true);
  });
});
