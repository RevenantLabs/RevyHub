import { describe, expect, it } from "vitest";
import { countInvalidMessage } from "@/features/reserve-capacity-planner/copy";
import { normalRaw, unqueriedAccountId } from "@/features/reserve-capacity-planner/fixtures/reserveCapacityPlanner.fixture";
import { parseReserveCapacityPlannerInput } from "@/features/reserve-capacity-planner/schema";
import type { ReserveCapacityPlannerRawInput } from "@/features/reserve-capacity-planner/types";

function withField(field: keyof ReserveCapacityPlannerRawInput, value: string): ReserveCapacityPlannerRawInput {
  return { ...normalRaw, [field]: value };
}

describe("parseReserveCapacityPlannerInput", () => {
  it("trims counts and treats a blank base reserve as the standard", () => {
    const result = parseReserveCapacityPlannerInput({ ...normalRaw, trustlines: " 1 ", baseReserve: "  " });
    expect(result.ok && result.value.subentries.trustlines).toBe(1n);
    expect(result.ok && result.value.baseReserveStroops).toBe(5_000_000n);
    expect(result.ok && result.value.baseReserveOverridden).toBe(false);
  });

  it("treats an explicit 0.5 XLM override as the standard value", () => {
    const result = parseReserveCapacityPlannerInput(withField("baseReserve", "0.5000000"));
    expect(result.ok && result.value.baseReserveOverridden).toBe(false);
    expect(result.ok && result.value.baseReserveStroops).toBe(5_000_000n);
  });

  it("rejects each count field with its own message", () => {
    expect(countInvalidMessage("trustlines")).not.toBe(countInvalidMessage("offers"));
    expect(countInvalidMessage("offers")).not.toBe(countInvalidMessage("dataEntries"));
    expect(countInvalidMessage("dataEntries")).not.toBe(countInvalidMessage("signers"));

    expect(parseReserveCapacityPlannerInput(withField("trustlines", "-1"))).toEqual({
      ok: false,
      code: "invalid_count",
      detail: "trustlines"
    });
    expect(parseReserveCapacityPlannerInput(withField("offers", "1.5"))).toEqual({
      ok: false,
      code: "invalid_count",
      detail: "offers"
    });
    expect(parseReserveCapacityPlannerInput(withField("dataEntries", "1e2"))).toEqual({
      ok: false,
      code: "invalid_count",
      detail: "dataEntries"
    });
    expect(parseReserveCapacityPlannerInput(withField("signers", ""))).toEqual({
      ok: false,
      code: "invalid_count",
      detail: "signers"
    });
    expect(countInvalidMessage("signers")).toContain("master key");
  });

  it("names the first invalid count when several are wrong", () => {
    const result = parseReserveCapacityPlannerInput({ ...normalRaw, trustlines: "-2", offers: "no" });
    expect(result).toEqual({ ok: false, code: "invalid_count", detail: "trustlines" });
  });

  it("rejects a negative or over-precise base reserve", () => {
    expect(parseReserveCapacityPlannerInput(withField("baseReserve", "-0.5"))).toEqual({
      ok: false,
      code: "invalid_base_reserve",
      detail: "baseReserve"
    });
    expect(parseReserveCapacityPlannerInput(withField("baseReserve", "0.00000001"))).toEqual({
      ok: false,
      code: "invalid_base_reserve",
      detail: "baseReserve"
    });
  });

  it("rejects a negative starting balance separately from a malformed one", () => {
    expect(parseReserveCapacityPlannerInput(withField("startingBalance", "-1"))).toEqual({
      ok: false,
      code: "negative_starting_balance",
      detail: "startingBalance"
    });
    expect(parseReserveCapacityPlannerInput(withField("startingBalance", "10.00000001"))).toEqual({
      ok: false,
      code: "invalid_starting_balance",
      detail: "startingBalance"
    });
  });

  it("drops a secret seed before it can be retained", () => {
    const secret = "S".repeat(56);
    const result = parseReserveCapacityPlannerInput(withField("startingBalance", secret));
    expect(result).toEqual({ ok: false, code: "secret_rejected", detail: "startingBalance" });
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(unqueriedAccountId.startsWith("G")).toBe(true);
  });
});
