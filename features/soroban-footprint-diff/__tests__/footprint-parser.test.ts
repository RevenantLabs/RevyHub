import { describe, expect, it } from "vitest";
import { parseSimulationFootprint } from "@/features/soroban-footprint-diff/lib/footprint-parser";
import {
  conflictSimulationJson,
  firstSimulationJson,
  invalidXdrSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

describe("parseSimulationFootprint", () => {
  it("parses labeled keys and resources", () => {
    const result = parseSimulationFootprint(firstSimulationJson);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.keys).toHaveLength(3);
    expect(result.value.resources.minResourceFee).toBe("100");
  });

  it("marks the same key in both sets as conflict", () => {
    const result = parseSimulationFootprint(conflictSimulationJson);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.keys).toEqual([
      { id: "CONTRACT_DATA:X", label: "CONTRACT_DATA:X", mode: "conflict" }
    ]);
  });

  it("rejects invalid JSON shapes", () => {
    expect(parseSimulationFootprint("{")).toEqual({ ok: false, code: "invalid_json" });
    expect(parseSimulationFootprint("{}")).toEqual({ ok: false, code: "invalid_json" });
  });

  it("rejects undecodable XDR-looking entries", () => {
    expect(parseSimulationFootprint(invalidXdrSimulationJson)).toEqual({
      ok: false,
      code: "invalid_footprint_xdr"
    });
  });
});
