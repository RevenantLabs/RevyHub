import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseMuxedPaymentRoutingAuditInput as parse } from "@/features/muxed-payment-routing-audit/schema";
import { baseAccount, muxedAddress } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
describe("base account validation", () => {
  it("accepts a public G address after trimming", () => expect(parse(` ${baseAccount} `)).toEqual({ ok: true, value: { accountId: baseAccount } }));
  it("rejects seeds, muxed addresses and invalid input without returning them", () => {
    for (const raw of [Keypair.fromRawEd25519Seed(Buffer.alloc(32, 31)).secret(), muxedAddress(7n), "", "Gbad"]) {
      expect(parse(raw)).toEqual({ ok: false, code: "invalid_account" });
      expect(JSON.stringify(parse(raw))).not.toContain(raw || "secret sentinel");
    }
  });
});
