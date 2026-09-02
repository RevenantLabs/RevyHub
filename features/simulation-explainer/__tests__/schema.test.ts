import { describe, expect, it } from "vitest";
import { parseSimulationExplainerInput } from "@/features/simulation-explainer/schema";
import { validTransactionXdr } from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

describe("parseSimulationExplainerInput", () => {
  it("rejects empty input", () => {
    const result = parseSimulationExplainerInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects input that is not base64", () => {
    const result = parseSimulationExplainerInput("!!!not-base64!!!");
    expect(result).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects base64 that is not a transaction envelope", () => {
    const result = parseSimulationExplainerInput(Buffer.from("hello world").toString("base64"));
    expect(result).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseSimulationExplainerInput(`  ${validTransactionXdr}  `);
    expect(result.ok && result.value.xdr).toBe(validTransactionXdr);
  });

  it("accepts a valid transaction envelope", () => {
    const result = parseSimulationExplainerInput(validTransactionXdr);
    expect(result).toEqual({ ok: true, value: { xdr: validTransactionXdr } });
  });
});
