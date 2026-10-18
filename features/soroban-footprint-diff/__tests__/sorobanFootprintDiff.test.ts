import { describe, expect, it } from "vitest";
import { runSorobanFootprintDiff } from "@/features/soroban-footprint-diff/lib/sorobanFootprintDiff";
import {
  firstSimulationJson,
  invalidXdrSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

describe("runSorobanFootprintDiff", () => {
  it("diffs two simulation footprints", async () => {
    const result = await runSorobanFootprintDiff({
      firstResult: firstSimulationJson,
      secondResult: secondSimulationJson
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.added.map((key) => key.id)).toEqual(["CONTRACT_DATA:D"]);
    expect(result.value.removed.map((key) => key.id)).toEqual(["CONTRACT_DATA:C"]);
    expect(result.value.modeChanges.some((change) => change.id === "CONTRACT_DATA:B")).toBe(true);
  });

  it("maps invalid JSON", async () => {
    expect(
      await runSorobanFootprintDiff({ firstResult: "{", secondResult: secondSimulationJson })
    ).toEqual({ ok: false, code: "invalid_json" });
  });

  it("maps invalid footprint XDR", async () => {
    expect(
      await runSorobanFootprintDiff({
        firstResult: invalidXdrSimulationJson,
        secondResult: secondSimulationJson
      })
    ).toEqual({ ok: false, code: "invalid_footprint_xdr" });
  });
});
