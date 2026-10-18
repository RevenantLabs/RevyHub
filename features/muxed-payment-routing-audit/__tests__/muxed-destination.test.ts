import { describe, expect, it } from "vitest";
import { normalizeMuxedDestination as normalize } from "@/features/muxed-payment-routing-audit/lib/muxed-destination";
import { baseAccount, senderAccount, muxedAddress } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
describe("operation destination", () => {
  it("keeps absent muxed fields direct", () => expect(normalize({ to: baseAccount }, baseAccount)).toEqual({ ok: true, value: null }));
  it("reads a matching muxed ID", () => expect(normalize({ to: baseAccount, to_muxed: muxedAddress(7n), to_muxed_id: "7" }, baseAccount)).toEqual({ ok: true, value: "7" }));
  it("ignores outgoing operations", () => expect(normalize({ to: senderAccount }, baseAccount)).toEqual({ ok: true, value: undefined }));
  it("rejects a partial or conflicting muxed pair", () => {
    expect(normalize({ to: baseAccount, to_muxed_id: "7" }, baseAccount)).toEqual({ ok: false, code: "malformed_payment" });
    expect(normalize({ to: baseAccount, to_muxed: muxedAddress(7n), to_muxed_id: "8" }, baseAccount)).toEqual({ ok: false, code: "malformed_payment" });
  });
});
