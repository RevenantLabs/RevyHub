/** Hypothetical classic subentry counts this planner adds together. */
export const COUNT_FIELDS = ["trustlines", "offers", "dataEntries", "signers"] as const;

export type CountField = (typeof COUNT_FIELDS)[number];

export type PlannerField = CountField | "baseReserve" | "startingBalance";

export function isCountField(field: string): field is CountField {
  return (COUNT_FIELDS as readonly string[]).includes(field);
}

/** Raw form strings. Amounts stay strings until stroop conversion. */
export interface ReserveCapacityPlannerRawInput {
  trustlines: string;
  offers: string;
  dataEntries: string;
  signers: string;
  /** XLM with up to 7 decimals. Blank selects the documented standard. */
  baseReserve: string;
  /** Optional XLM. Blank skips the spendable projection. */
  startingBalance: string;
}

export interface HypotheticalSubentries {
  trustlines: bigint;
  offers: bigint;
  dataEntries: bigint;
  signers: bigint;
}

export interface ReserveCapacityPlannerInput {
  subentries: HypotheticalSubentries;
  subentryCount: bigint;
  baseReserveStroops: bigint;
  baseReserveOverridden: boolean;
  startingBalanceStroops: bigint | null;
}

/** Every amount is a fixed 7-decimal XLM string or a stroop integer string. */
export interface ReserveCapacityPlannerResult {
  trustlines: string;
  offers: string;
  dataEntries: string;
  signers: string;
  subentryCount: string;
  baseReserveXlm: string;
  baseReserveStroops: string;
  baseReserveOverridden: boolean;
  minimumBalanceXlm: string;
  minimumBalanceStroops: string;
  accountReserveXlm: string;
  accountReserveStroops: string;
  subentryReserveXlm: string;
  subentryReserveStroops: string;
  startingBalanceXlm: string | null;
  spendableBalanceXlm: string | null;
  spendableBalanceStroops: string | null;
  belowMinimum: boolean;
  shortfallXlm: string | null;
}

export type ReserveCapacityPlannerErrorCode =
  | "invalid_count"
  | "invalid_base_reserve"
  | "negative_starting_balance"
  | "invalid_starting_balance"
  | "secret_rejected"
  | "unexpected_failure";
