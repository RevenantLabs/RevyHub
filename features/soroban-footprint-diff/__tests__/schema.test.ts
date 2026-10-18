import { describe, expect, it } from "vitest";
import { parseSorobanFootprintDiffInput } from "@/features/soroban-footprint-diff/schema";
import { MAX_INPUT_CHARS } from "@/features/soroban-footprint-diff/types";
import {
  firstSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

describe("parseSorobanFootprintDiffInput", () => {
  it("accepts two non-empty payloads under the size cap", () => {
    expect(
      parseSorobanFootprintDiffInput({
        firstResult: firstSimulationJson,
        secondResult: secondSimulationJson
      }).ok
    ).toBe(true);
  });

  it("rejects empty sides", () => {
    expect(
      parseSorobanFootprintDiffInput({ firstResult: "", secondResult: secondSimulationJson })
    ).toEqual({ ok: false, code: "empty_first_result" });
    expect(
      parseSorobanFootprintDiffInput({ firstResult: firstSimulationJson, secondResult: "  " })
    ).toEqual({ ok: false, code: "empty_second_result" });
  });

  it("rejects oversized pastes", () => {
    expect(
      parseSorobanFootprintDiffInput({
        firstResult: "x".repeat(MAX_INPUT_CHARS + 1),
        secondResult: secondSimulationJson
      })
    ).toEqual({ ok: false, code: "too_large" });
  });
});
