import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseMonitorInput } from "@/features/horizon-rate-limit-monitor/schema";
import { accountId } from "@/features/horizon-rate-limit-monitor/fixtures/horizonRateLimitMonitor.fixture";

describe("monitor input", () => {
  it("accepts an optional valid account and threshold boundaries", () => {
    expect(parseMonitorInput("", "0")).toEqual({ ok: true, value: { accountId: null, lowQuotaThreshold: 0 } });
    expect(parseMonitorInput(` ${accountId} `, "999999")).toEqual({ ok: true, value: { accountId, lowQuotaThreshold: 999999 } });
  });
  it("rejects seeds on prefix and malformed public IDs", () => {
    const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).secret();
    expect(parseMonitorInput(seed, "10")).toEqual({ ok: false, code: "invalid_account" });
    expect(parseMonitorInput("Snot-even-a-seed", "10")).toEqual({ ok: false, code: "invalid_account" });
    expect(parseMonitorInput("Gbad", "10")).toEqual({ ok: false, code: "invalid_account" });
  });
  it.each(["", "-1", "1.5", "1000000", "01", "abc"])("rejects threshold %s", (value) => {
    expect(parseMonitorInput("", value)).toEqual({ ok: false, code: "invalid_threshold" });
  });
});
