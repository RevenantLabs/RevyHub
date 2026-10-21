import { describe, expect, it } from "vitest";
import { mergeEligibility } from "../lib/eligibility-merge";

const okIssuer = (authClawbackEnabled: boolean) => ({ ok: true as const, value: { authClawbackEnabled } });
const okHolder = (clawbackEnabled: boolean) => ({ ok: true as const, value: { clawbackEnabled } });
const failed = { ok: false as const, code: "request_failed" as const };

describe("mergeEligibility", () => {
  it("is eligible when both signals agree the flag is on", () => {
    expect(mergeEligibility(okIssuer(true), okHolder(true))).toEqual({ kind: "eligible" });
  });

  it("is not eligible when both signals agree the flag is off", () => {
    expect(mergeEligibility(okIssuer(false), okHolder(false))).toEqual({ kind: "not_eligible" });
  });

  it("reports a disagreement explicitly rather than inferring one signal from the other", () => {
    expect(mergeEligibility(okIssuer(true), okHolder(false))).toEqual({
      kind: "disagreement",
      issuerSaysEnabled: true,
      holderSaysEnabled: false
    });
  });

  it("is unknown when either side failed", () => {
    expect(mergeEligibility(failed, okHolder(true))).toEqual({ kind: "unknown" });
    expect(mergeEligibility(okIssuer(true), failed)).toEqual({ kind: "unknown" });
  });
});
