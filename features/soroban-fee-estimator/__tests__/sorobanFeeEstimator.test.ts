import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { withMswHandlers } from "@/core/testing/msw";
import {
  extractSorobanResources,
  runSorobanFeeEstimator,
} from "@/features/soroban-fee-estimator/lib/sorobanFeeEstimator";
import { handlers } from "@/features/soroban-fee-estimator/msw/handlers";
import {
  lowFeeSorobanEnvelope,
  validSorobanEnvelope,
} from "@/features/soroban-fee-estimator/fixtures/sorobanFeeEstimator.fixture";

const server = withMswHandlers(
  ...handlers,
  http.post("https://soroban-testnet.stellar.org", async ({ request }) => {
    const body = (await request.json()) as { method?: string };
    if (body.method === "getFeeStats") {
      return HttpResponse.json({ jsonrpc: "2.0", id: 1, result: {
        sorobanInclusionFee: { p50: "210" },
        inclusionFee: { p50: "210" },
        latestLedger: 1234567,
      }});
    }
    return HttpResponse.json({ error: "not mocked" }, { status: 500 });
  })
);

describe("extractSorobanResources", () => {
  it("rejects invalid XDR", () => {
    const result = extractSorobanResources("not-valid-xdr");
    expect(result).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects classic transactions without Soroban data", () => {
    const classicEnvelope =
      "AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAGQAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAABqmGdmAAAAAAAAAAEAAAAAAAAAAQAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAAAAAAAAAJiWgAAAAAAAAAAA";
    const result = extractSorobanResources(classicEnvelope);
    expect(result).toEqual({ ok: false, code: "not_soroban" });
  });

  it("extracts resources from a valid Soroban envelope", () => {
    const result = extractSorobanResources(validSorobanEnvelope);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.instructions).toBeGreaterThan(0n);
    expect(result.value.transactionSizeBytes).toBeGreaterThan(0n);
  });
});

describe("runSorobanFeeEstimator", () => {
  it("returns a fee estimate for a valid Soroban envelope", async () => {
    const result = await runSorobanFeeEstimator({ envelope: validSorobanEnvelope }, "testnet");
    if (!result.ok) {
      throw new Error(`Expected ok result but got error: ${result.code}`);
    }
    expect(result.value.latestLedger).toBe(1234567);
    expect(result.value.inclusionFeeStroops).toBe(210n);
    expect(result.value.components.length).toBe(5);
    expect(result.value.dominantComponent).toBe("instructions");
  });

  it("detects a shortfall when declared fee is too low", async () => {
    const result = await runSorobanFeeEstimator({ envelope: lowFeeSorobanEnvelope }, "testnet");
    if (!result.ok) {
      throw new Error(`Expected ok result but got error: ${result.code}`);
    }
    expect(result.value.shortfallStroops).toBeGreaterThan(0n);
  });
});
