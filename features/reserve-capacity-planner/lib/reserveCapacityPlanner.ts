import { ok, type Result } from "@/core/result/result";
import { stroopsToXlm } from "@/features/reserve-capacity-planner/lib/format";
import { parseReserveCapacityPlannerInput } from "@/features/reserve-capacity-planner/schema";
import {
  accountReserveStroops,
  minimumBalanceStroops,
  subentryReserveStroops
} from "@/features/reserve-capacity-planner/lib/reserve-formula";
import { projectSpendableBalance } from "@/features/reserve-capacity-planner/lib/spendable-projection";
import type {
  PlannerField,
  ReserveCapacityPlannerErrorCode,
  ReserveCapacityPlannerInput,
  ReserveCapacityPlannerRawInput,
  ReserveCapacityPlannerResult
} from "@/features/reserve-capacity-planner/types";

/** Builds the projection from counts that have already been validated. */
export function planReserveCapacity(input: ReserveCapacityPlannerInput): ReserveCapacityPlannerResult {
  const minimum = minimumBalanceStroops(input.baseReserveStroops, input.subentryCount);
  const accountReserve = accountReserveStroops(input.baseReserveStroops);
  const subentryReserve = subentryReserveStroops(input.baseReserveStroops, input.subentryCount);
  const spendable = projectSpendableBalance(minimum, input.startingBalanceStroops);

  return {
    trustlines: input.subentries.trustlines.toString(),
    offers: input.subentries.offers.toString(),
    dataEntries: input.subentries.dataEntries.toString(),
    signers: input.subentries.signers.toString(),
    subentryCount: input.subentryCount.toString(),
    baseReserveXlm: stroopsToXlm(input.baseReserveStroops),
    baseReserveStroops: input.baseReserveStroops.toString(),
    baseReserveOverridden: input.baseReserveOverridden,
    minimumBalanceXlm: stroopsToXlm(minimum),
    minimumBalanceStroops: minimum.toString(),
    accountReserveXlm: stroopsToXlm(accountReserve),
    accountReserveStroops: accountReserve.toString(),
    subentryReserveXlm: stroopsToXlm(subentryReserve),
    subentryReserveStroops: subentryReserve.toString(),
    startingBalanceXlm:
      input.startingBalanceStroops === null ? null : stroopsToXlm(input.startingBalanceStroops),
    spendableBalanceXlm:
      spendable.spendableStroops === null ? null : stroopsToXlm(spendable.spendableStroops),
    spendableBalanceStroops:
      spendable.spendableStroops === null ? null : spendable.spendableStroops.toString(),
    belowMinimum: spendable.belowMinimum,
    shortfallXlm: spendable.shortfallStroops === null ? null : stroopsToXlm(spendable.shortfallStroops)
  };
}

/** Parses raw input and projects the reserve. Expected failures stay in the Result. */
export function runReserveCapacityPlanner(
  raw: ReserveCapacityPlannerRawInput
): Result<ReserveCapacityPlannerResult, ReserveCapacityPlannerErrorCode, PlannerField> {
  const parsed = parseReserveCapacityPlannerInput(raw);
  if (!parsed.ok) return parsed;
  return ok(planReserveCapacity(parsed.value));
}
