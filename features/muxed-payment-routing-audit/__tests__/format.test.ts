import { describe, expect, it } from "vitest";
import { amountToStroops, formatStroops, formatAsset, formatDate } from "@/features/muxed-payment-routing-audit/lib/format";
import { issuerAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
describe("exact formatting", () => {
  it("round trips amounts beyond Number safe precision", () => expect(formatStroops(amountToStroops("9007199254740993.0000001")!)).toBe("9007199254740993.0000001"));
  it("rejects excess precision and exponent syntax", () => { expect(amountToStroops("1.00000001")).toBeNull(); expect(amountToStroops("1e3")).toBeNull(); });
  it("shows issuer and UTC date", () => { expect(formatAsset("USD", issuerAccount)).toContain(issuerAccount); expect(formatDate("2026-09-28T08:00:00Z")).toContain("UTC"); });
});
