import { describe, expect, it } from "vitest";
import { handlers } from "@/features/reserve-capacity-planner/msw/handlers";
import { toReserveCapacityPlannerErrorCode } from "@/features/reserve-capacity-planner/lib/reserveCapacityPlanner.errors";
import { runReserveCapacityPlanner } from "@/features/reserve-capacity-planner/lib/reserveCapacityPlanner";
import { normalExpected, normalRaw, unqueriedAccountId } from "@/features/reserve-capacity-planner/fixtures/reserveCapacityPlanner.fixture";
import {
  defaultScenarioExpected,
  defaultScenarioRaw,
  underfundedRaw
} from "@/features/reserve-capacity-planner/fixtures/default-scenario.fixture";
import {
  customBaseReserveExpected,
  customBaseReserveRaw
} from "@/features/reserve-capacity-planner/fixtures/custom-base-reserve.fixture";

describe("runReserveCapacityPlanner", () => {
  it("matches the hand-computed default-base projection", () => {
    // 5_000_000 × (2 + 10) = 60_000_000 stroops = 6 XLM.
    const result = runReserveCapacityPlanner(normalRaw);
    expect(result).toEqual({ ok: true, value: normalExpected });
    expect(result.ok && result.value.minimumBalanceStroops).toBe("60000000");
    expect(JSON.stringify(result)).not.toContain(unqueriedAccountId);
  });

  it("projects a bare account at the documented 0.5 XLM base reserve", () => {
    // 5_000_000 × 2 = 10_000_000 stroops = 1 XLM.
    expect(runReserveCapacityPlanner(defaultScenarioRaw)).toEqual({ ok: true, value: defaultScenarioExpected });
  });

  it("uses an overridden base reserve in exact stroops", () => {
    // 12_500_000 × (2 + 10) = 150_000_000 stroops = 15 XLM.
    const result = runReserveCapacityPlanner(customBaseReserveRaw);
    expect(result).toEqual({ ok: true, value: customBaseReserveExpected });
    expect(result.ok && result.value.minimumBalanceStroops).toBe("150000000");
  });

  it("clamps spendable to zero when the starting balance is short", () => {
    // Minimum 10_000_000 stroops, starting 5_000_000, shortfall 5_000_000.
    const result = runReserveCapacityPlanner(underfundedRaw);
    expect(result.ok && result.value.belowMinimum).toBe(true);
    expect(result.ok && result.value.spendableBalanceStroops).toBe("0");
    expect(result.ok && result.value.spendableBalanceXlm).toBe("0.0000000");
    expect(result.ok && result.value.shortfallXlm).toBe("0.5000000");
  });

  it("keeps a one-stroop base reserve exact", () => {
    const result = runReserveCapacityPlanner({
      trustlines: "1",
      offers: "0",
      dataEntries: "0",
      signers: "0",
      baseReserve: "0.0000001",
      startingBalance: ""
    });
    // 1 × (2 + 1) = 3 stroops.
    expect(result.ok && result.value.minimumBalanceStroops).toBe("3");
    expect(result.ok && result.value.minimumBalanceXlm).toBe("0.0000003");
  });

  it("does not install network handlers", () => {
    expect(handlers).toEqual([]);
  });

  it("maps unexpected throws to a code and drops the exception text", () => {
    const secret = `S${"A".repeat(55)}`;
    expect(toReserveCapacityPlannerErrorCode(new Error(secret))).toBe("unexpected_failure");
  });
});
