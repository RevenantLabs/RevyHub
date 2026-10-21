import type { ReserveCapacityPlannerRawInput, ReserveCapacityPlannerResult } from "@/features/reserve-capacity-planner/types";

/**
 * Zero subentries and the documented standard base reserve.
 * Minimum = 5,000,000 × (2 + 0) = 10,000,000 stroops = 1.0000000 XLM.
 * No starting balance, so spendable stays unset.
 */
export const defaultScenarioRaw: ReserveCapacityPlannerRawInput = {
  trustlines: "0",
  offers: "0",
  dataEntries: "0",
  signers: "0",
  baseReserve: "",
  startingBalance: ""
};

export const defaultScenarioExpected: ReserveCapacityPlannerResult = {
  trustlines: "0",
  offers: "0",
  dataEntries: "0",
  signers: "0",
  subentryCount: "0",
  baseReserveXlm: "0.5000000",
  baseReserveStroops: "5000000",
  baseReserveOverridden: false,
  minimumBalanceXlm: "1.0000000",
  minimumBalanceStroops: "10000000",
  accountReserveXlm: "1.0000000",
  accountReserveStroops: "10000000",
  subentryReserveXlm: "0.0000000",
  subentryReserveStroops: "0",
  startingBalanceXlm: null,
  spendableBalanceXlm: null,
  spendableBalanceStroops: null,
  belowMinimum: false,
  shortfallXlm: null
};

/** Same plan, but a 0.5 XLM starting balance sits under the 1 XLM minimum. */
export const underfundedRaw: ReserveCapacityPlannerRawInput = {
  ...defaultScenarioRaw,
  startingBalance: "0.5"
};
