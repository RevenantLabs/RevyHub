import type { ReserveCapacityPlannerRawInput, ReserveCapacityPlannerResult } from "@/features/reserve-capacity-planner/types";

/**
 * Custom base reserve 1.25 XLM = 12,500,000 stroops.
 * Subentries 4 + 1 + 2 + 3 = 10.
 * Minimum = 12,500,000 × (2 + 10) = 150,000,000 stroops = 15.0000000 XLM.
 * Starting balance 20 XLM = 200,000,000 stroops.
 * Spendable = 200,000,000 − 150,000,000 = 50,000,000 stroops = 5.0000000 XLM.
 */
export const customBaseReserveRaw: ReserveCapacityPlannerRawInput = {
  trustlines: "4",
  offers: "1",
  dataEntries: "2",
  signers: "3",
  baseReserve: "1.25",
  startingBalance: "20"
};

export const customBaseReserveExpected: ReserveCapacityPlannerResult = {
  trustlines: "4",
  offers: "1",
  dataEntries: "2",
  signers: "3",
  subentryCount: "10",
  baseReserveXlm: "1.2500000",
  baseReserveStroops: "12500000",
  baseReserveOverridden: true,
  minimumBalanceXlm: "15.0000000",
  minimumBalanceStroops: "150000000",
  accountReserveXlm: "2.5000000",
  accountReserveStroops: "25000000",
  subentryReserveXlm: "12.5000000",
  subentryReserveStroops: "125000000",
  startingBalanceXlm: "20.0000000",
  spendableBalanceXlm: "5.0000000",
  spendableBalanceStroops: "50000000",
  belowMinimum: false,
  shortfallXlm: "0.0000000"
};
