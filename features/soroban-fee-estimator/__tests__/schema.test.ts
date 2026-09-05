import { describe, expect, it } from "vitest";
import { parseSorobanFeeEstimatorInput } from "@/features/soroban-fee-estimator/schema";
import { validSorobanEnvelope } from "@/features/soroban-fee-estimator/fixtures/sorobanFeeEstimator.fixture";

describe("parseSorobanFeeEstimatorInput", () => {
  it("rejects empty input", () => {
    const result = parseSorobanFeeEstimatorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects non-base64 input", () => {
    const result = parseSorobanFeeEstimatorInput("not-base64!!!");
    expect(result).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects input whose length is not a multiple of 4", () => {
    const result = parseSorobanFeeEstimatorInput("abc");
    expect(result).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("normalises surrounding whitespace and returns the envelope", () => {
    const result = parseSorobanFeeEstimatorInput(`  ${validSorobanEnvelope}  `);
    expect(result.ok && result.value.envelope).toBe(validSorobanEnvelope);
  });
});
