import {
  isCountField,
  type CountField,
  type PlannerField,
  type ReserveCapacityPlannerErrorCode
} from "@/features/reserve-capacity-planner/types";

export const copy = {
  subentriesLegend: "Hypothetical subentries",
  subentriesHint: "Whole numbers only. The master key is already covered by the two account reserves.",
  baseReserveLabel: "Base reserve override (XLM)",
  baseReserveHint: "Leave blank to use the documented standard of 0.5 XLM (5,000,000 stroops).",
  baseReservePlaceholder: "0.5",
  startingBalanceLabel: "Starting balance (XLM)",
  startingBalanceHint: "Optional. Shows how much would sit above the projected minimum.",
  startingBalancePlaceholder: "Leave blank to skip",
  submit: "Project reserve",
  loading: "Projecting reserve locally...",
  reset: "Reset",
  emptyTitle: "No reserve projected yet",
  emptyDescription:
    "Enter hypothetical trustlines, offers, data entries and signers. The planner does the arithmetic locally and does not load an account.",
  resultTitle: "Projected minimum reserve",
  breakdownTitle: "Reserve breakdown",
  minimumBalanceLabel: "Minimum balance",
  baseReserveUsedLabel: "Base reserve used",
  subentryCountLabel: "Subentry count",
  accountReserveLabel: "Account reserve (2 × base reserve)",
  subentryReserveLabel: "Subentry reserve",
  trustlinesLabel: "Trustlines",
  offersLabel: "Offers",
  dataEntriesLabel: "Data entries",
  signersLabel: "Signer subentries",
  startingBalanceResultLabel: "Starting balance",
  spendableLabel: "Spendable balance",
  shortfallLabel: "Shortfall",
  notProvided: "Not provided",
  belowMinimumTitle: "Starting balance is below the minimum.",
  belowMinimumDescription: (shortfall: string) =>
    `Spendable balance is 0 XLM. Add at least ${shortfall} before this plan can spend.`,
  defaultBaseReserveNote:
    "Using the documented standard base reserve of 0.5 XLM (5,000,000 stroops). That standard can change, and this is not a live ledger reading.",
  customBaseReserveNote:
    "Using the base reserve you entered. A network's live base reserve can differ from this scenario.",
  offlineNote: "Calculated on this device. No account is loaded and no network is queried.",
  formulaLine: (baseXlm: string, subentries: string, minimumXlm: string) =>
    `Minimum balance = ${baseXlm} × (2 + ${subentries}) = ${minimumXlm}`,
  stroopFormulaLine: (baseStroops: string, subentries: string, minimumStroops: string) =>
    `${baseStroops} × (2 + ${subentries}) = ${minimumStroops}`,
  counts: {
    trustlines: {
      label: "Trustlines",
      hint: "Hypothetical trustlines. Use a whole number, zero or greater.",
      invalid: "Enter trustlines as a whole number that is zero or greater."
    },
    offers: {
      label: "Offers",
      hint: "Hypothetical offers. Use a whole number, zero or greater.",
      invalid: "Enter offers as a whole number that is zero or greater."
    },
    dataEntries: {
      label: "Data entries",
      hint: "Hypothetical data entries. Use a whole number, zero or greater.",
      invalid: "Enter data entries as a whole number that is zero or greater."
    },
    signers: {
      label: "Signer subentries",
      hint: "Additional signers only. Do not count the master key.",
      invalid:
        "Enter signer subentries as a whole number that is zero or greater. Do not count the master key."
    }
  }
} as const;

export const errorCopy: Record<ReserveCapacityPlannerErrorCode, { title: string; description: string }> = {
  invalid_count: {
    title: "A count is not a whole number",
    description: "Replace the highlighted count with a whole number that is zero or greater."
  },
  invalid_base_reserve: {
    title: "Base reserve needs a different amount",
    description:
      "Enter the base reserve in XLM with at most 7 decimal places, or leave it blank to use 0.5 XLM (5,000,000 stroops)."
  },
  negative_starting_balance: {
    title: "Starting balance cannot be negative",
    description: "Enter a starting balance of zero or more, or leave it blank to skip the spendable projection."
  },
  invalid_starting_balance: {
    title: "Starting balance needs a different amount",
    description: "Enter the starting balance in XLM with at most 7 decimal places, or leave it blank."
  },
  secret_rejected: {
    title: "Secret keys are not accepted",
    description: "Remove the secret key. This planner only accepts counts and XLM amounts, and it never stores a seed."
  },
  unexpected_failure: {
    title: "The projection could not be completed",
    description: "Check the counts and project again. Nothing was sent to the network."
  }
};

/** Field alert copy. Validation errors stay on the field and are not repeated in a banner. */
export function fieldErrorMessage(
  code: ReserveCapacityPlannerErrorCode,
  field: PlannerField | undefined
): string | null {
  if (code === "invalid_count" && field && isCountField(field)) return copy.counts[field].invalid;
  if (code === "invalid_base_reserve" && field === "baseReserve") return errorCopy.invalid_base_reserve.description;
  if (code === "negative_starting_balance" && field === "startingBalance") {
    return errorCopy.negative_starting_balance.description;
  }
  if (code === "invalid_starting_balance" && field === "startingBalance") {
    return errorCopy.invalid_starting_balance.description;
  }
  if (code === "secret_rejected" && field) return errorCopy.secret_rejected.description;
  return null;
}

export function countInvalidMessage(field: CountField): string {
  return copy.counts[field].invalid;
}
