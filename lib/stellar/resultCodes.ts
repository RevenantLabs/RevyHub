/**
 * Human-readable explanations for Stellar transaction/operation result codes.
 *
 * Source: https://developers.stellar.org/docs/data/horizon/api-reference/errors/result-codes/transactions
 * and the sibling operation result code references linked from that page.
 *
 * Update process: when Stellar adds or renames a result code, add/update the entry in the
 * relevant table below and bump STELLAR_RESULT_CODES_VERSION. assertNoDuplicateResultCodes()
 * runs at import time and throws if a code is accidentally defined in more than one table.
 */

export const STELLAR_RESULT_CODES_VERSION = "2026-07-30.1";
export const STELLAR_RESULT_CODES_SOURCE =
  "https://developers.stellar.org/docs/data/horizon/api-reference/errors/result-codes/transactions";

export type ResultCodeLevel = "transaction" | "operation";
export type OperationResultCategory = "payment" | "trustline" | "operation";
export type ResultCodeCategory = "transaction" | OperationResultCategory;

export interface ResultCodeExplanation {
  code: string;
  category: ResultCodeCategory;
  title: string;
  /** What the code means. Never asserts a guaranteed fix. */
  explanation: string;
  /** A non-prescriptive next step to investigate, not a promise of resolution. */
  hint: string;
  recognized: boolean;
}

interface ResultCodeEntry {
  title: string;
  explanation: string;
  hint: string;
}

type ResultCodeTable = Record<string, ResultCodeEntry>;

const TRANSACTION_RESULT_CODES: ResultCodeTable = {
  tx_success: {
    title: "Transaction succeeded",
    explanation: "Every operation in the transaction applied successfully.",
    hint: "No action needed."
  },
  tx_failed: {
    title: "An operation failed",
    explanation: "At least one operation inside the transaction failed, so the whole transaction was reverted.",
    hint: "Check the per-operation result codes to see which operation failed and why."
  },
  tx_too_early: {
    title: "Submitted too early",
    explanation: "The transaction's time bounds have not started yet.",
    hint: "Confirm the transaction's minTime and resubmit once the ledger reaches it."
  },
  tx_too_late: {
    title: "Submitted too late",
    explanation: "The transaction's time bounds have already expired.",
    hint: "Rebuild the transaction with a fresh time bound and sequence number."
  },
  tx_missing_operation: {
    title: "No operations",
    explanation: "The transaction did not include any operations.",
    hint: "Add at least one operation before signing and submitting."
  },
  tx_bad_seq: {
    title: "Bad sequence number",
    explanation: "The transaction's sequence number does not match what the source account expects.",
    hint: "Reload the account to get its current sequence number and rebuild the transaction."
  },
  tx_bad_auth: {
    title: "Bad authorization",
    explanation: "The transaction is missing a valid signature, or has too few signatures for the account's thresholds.",
    hint: "Verify every required signer has signed and that signature weights meet the account's thresholds."
  },
  tx_insufficient_balance: {
    title: "Insufficient balance",
    explanation: "The source account does not have enough XLM to cover the transaction fee and minimum balance.",
    hint: "Fund the source account with more XLM before resubmitting."
  },
  tx_no_source_account: {
    title: "Source account not found",
    explanation: "The account referenced as the transaction source does not exist on this network.",
    hint: "Confirm the account has been created and that you're pointed at the right network."
  },
  tx_insufficient_fee: {
    title: "Fee too low",
    explanation: "The transaction fee is below the network's current minimum or surge price.",
    hint: "Rebuild the transaction with a higher fee and resubmit."
  },
  tx_bad_auth_extra: {
    title: "Unused signatures present",
    explanation: "The transaction has more signatures than needed, which Stellar treats as invalid.",
    hint: "Remove extra signatures and resubmit with only the required signers."
  },
  tx_internal_error: {
    title: "Internal error",
    explanation: "An unexpected error occurred on the Stellar network while processing this transaction.",
    hint: "Retry later; if it persists, check Stellar network status."
  },
  tx_not_supported: {
    title: "Not supported",
    explanation: "The transaction uses a feature that isn't supported by the current network protocol version.",
    hint: "Check which protocol version introduced this feature and confirm the network supports it."
  },
  tx_fee_bump_inner_failed: {
    title: "Fee bump inner transaction failed",
    explanation: "The wrapped inner transaction of a fee-bump transaction failed.",
    hint: "Inspect the inner transaction's own result code for the underlying cause."
  },
  tx_bad_sponsorship: {
    title: "Bad sponsorship",
    explanation: "A sponsorship relationship referenced by the transaction is invalid or incomplete.",
    hint: "Review the begin/end sponsoring future reserves operations for a mismatch."
  }
};

const COMMON_OPERATION_RESULT_CODES: ResultCodeTable = {
  op_success: {
    title: "Operation succeeded",
    explanation: "This operation applied successfully.",
    hint: "No action needed."
  },
  op_malformed: {
    title: "Malformed operation",
    explanation: "The operation's parameters are invalid, such as a negative amount or an invalid asset.",
    hint: "Double-check the operation's fields before rebuilding the transaction."
  },
  op_bad_auth: {
    title: "Bad authorization",
    explanation: "The signature covering this operation is missing or insufficient for the account's thresholds.",
    hint: "Confirm the required signer(s) for this operation have signed with enough weight."
  },
  op_no_account: {
    title: "Account not found",
    explanation: "An account referenced by this operation does not exist on this network.",
    hint: "Verify the account ID and that it has been created on this network."
  },
  op_not_supported: {
    title: "Not supported",
    explanation: "This operation type isn't supported by the current network protocol version.",
    hint: "Check whether the operation requires a newer protocol version than the network is running."
  },
  op_too_many_subentries: {
    title: "Too many subentries",
    explanation: "The account has reached the maximum number of subentries (trustlines, offers, signers, data entries).",
    hint: "Remove unused subentries or increase the account's reserves before adding more."
  },
  op_exceeded_work_limit: {
    title: "Exceeded work limit",
    explanation: "The operation would require more processing than the ledger allows in a single transaction.",
    hint: "Split the work across multiple transactions."
  },
  op_too_many_sponsoring: {
    title: "Too many sponsoring relationships",
    explanation: "The account is already sponsoring the maximum number of reserves.",
    hint: "End some existing sponsorships before starting new ones."
  }
};

const PAYMENT_RESULT_CODES: ResultCodeTable = {
  op_underfunded: {
    title: "Underfunded",
    explanation: "The source account doesn't hold enough of the asset being sent to cover this payment.",
    hint: "Check the sender's balance for the asset and reduce the amount or add funds."
  },
  op_src_no_trust: {
    title: "Source missing trustline",
    explanation: "The sending account doesn't have a trustline for the asset being sent.",
    hint: "Establish a trustline for the asset from the source account first."
  },
  op_src_not_authorized: {
    title: "Source not authorized",
    explanation: "The asset issuer has not authorized the sending account to hold or transfer this asset.",
    hint: "Ask the asset issuer to authorize the source account's trustline."
  },
  op_no_destination: {
    title: "Destination not found",
    explanation: "The destination account does not exist on this network.",
    hint: "Confirm the destination address and that the account has been created."
  },
  op_no_trust: {
    title: "Destination missing trustline",
    explanation: "The destination account doesn't have a trustline for the asset being sent.",
    hint: "Ask the recipient to establish a trustline for this asset before retrying."
  },
  op_not_authorized: {
    title: "Destination not authorized",
    explanation: "The asset issuer has not authorized the destination account to hold this asset.",
    hint: "Ask the asset issuer to authorize the destination account's trustline."
  },
  op_line_full: {
    title: "Trustline limit reached",
    explanation: "Receiving this payment would exceed the destination's trustline limit for the asset.",
    hint: "Ask the recipient to raise their trustline limit, or send a smaller amount."
  },
  op_no_issuer: {
    title: "Issuer not found",
    explanation: "The asset's issuer account does not exist on this network.",
    hint: "Confirm the asset code and issuer address are correct for this network."
  }
};

const TRUSTLINE_RESULT_CODES: ResultCodeTable = {
  op_change_trust_malformed: {
    title: "Malformed trustline request",
    explanation: "The trustline change request has invalid parameters, such as trusting a native asset.",
    hint: "Confirm the asset code and issuer are valid and that the asset isn't native XLM."
  },
  op_change_trust_no_issuer: {
    title: "Issuer not found",
    explanation: "The asset's issuer account does not exist on this network.",
    hint: "Confirm the issuer address and network before retrying."
  },
  op_change_trust_invalid_limit: {
    title: "Invalid trust limit",
    explanation: "The requested trustline limit is invalid, such as being lower than the current balance.",
    hint: "Set a limit at or above the account's current balance of the asset."
  },
  op_change_trust_low_reserve: {
    title: "Insufficient reserve",
    explanation: "The account doesn't have enough XLM reserved to add another trustline.",
    hint: "Add more XLM to the account to cover the additional minimum balance reserve."
  },
  op_change_trust_self_not_allowed: {
    title: "Self-trust not allowed",
    explanation: "An account cannot create a trustline to an asset that it itself issues.",
    hint: "Use a different account than the asset issuer to hold this trustline."
  },
  op_change_trust_trust_line_missing: {
    title: "Trustline missing",
    explanation: "There is no existing trustline to update or remove for this asset.",
    hint: "Create the trustline first if the account needs to hold this asset."
  },
  op_change_trust_cannot_delete: {
    title: "Cannot delete trustline",
    explanation: "The trustline can't be removed, typically because it still holds a nonzero balance or open offers.",
    hint: "Clear the balance and any offers using this asset before removing the trustline."
  },
  op_change_trust_not_auth_maintain_liabilities: {
    title: "Not authorized to maintain liabilities",
    explanation: "The issuer has restricted this account to maintaining liabilities only, not increasing them.",
    hint: "Ask the asset issuer about the account's current authorization level."
  }
};

const ALL_OPERATION_RESULT_CODES: ResultCodeTable = {
  ...COMMON_OPERATION_RESULT_CODES,
  ...PAYMENT_RESULT_CODES,
  ...TRUSTLINE_RESULT_CODES
};

function assertNoDuplicateResultCodes(tables: ResultCodeTable[], label: string) {
  const owners = new Map<string, number>();

  tables.forEach((table, index) => {
    Object.keys(table).forEach((code) => {
      const existingOwner = owners.get(code);
      if (existingOwner !== undefined && existingOwner !== index) {
        throw new Error(`Duplicate Stellar ${label} result code "${code}" defined in more than one mapping table.`);
      }
      owners.set(code, index);
    });
  });
}

assertNoDuplicateResultCodes(
  [COMMON_OPERATION_RESULT_CODES, PAYMENT_RESULT_CODES, TRUSTLINE_RESULT_CODES],
  "operation"
);

const UNKNOWN_CODE_HINT =
  "This code isn't in RevyHubX's mapping yet. Check the official Stellar result code reference before assuming a cause.";

function unknownExplanation(code: string, category: ResultCodeCategory): ResultCodeExplanation {
  return {
    code,
    category,
    title: "Unrecognized result code",
    explanation: `Stellar returned "${code}", which isn't in this app's mapping (version ${STELLAR_RESULT_CODES_VERSION}).`,
    hint: UNKNOWN_CODE_HINT,
    recognized: false
  };
}

function fromTable(
  table: ResultCodeTable,
  code: string,
  category: ResultCodeCategory
): ResultCodeExplanation | undefined {
  const entry = table[code];
  if (!entry) return undefined;

  return { code, category, recognized: true, ...entry };
}

export function explainTransactionResultCode(code: string): ResultCodeExplanation {
  return fromTable(TRANSACTION_RESULT_CODES, code, "transaction") ?? unknownExplanation(code, "transaction");
}

export function explainOperationResultCode(
  code: string,
  category: OperationResultCategory = "operation"
): ResultCodeExplanation {
  const categoryTable =
    category === "payment" ? PAYMENT_RESULT_CODES : category === "trustline" ? TRUSTLINE_RESULT_CODES : undefined;

  return (
    (categoryTable && fromTable(categoryTable, code, category)) ??
    fromTable(COMMON_OPERATION_RESULT_CODES, code, category) ??
    fromTable(ALL_OPERATION_RESULT_CODES, code, category) ??
    unknownExplanation(code, category)
  );
}

export function explainResultCode(
  code: string,
  level: ResultCodeLevel,
  operationCategory: OperationResultCategory = "operation"
): ResultCodeExplanation {
  return level === "transaction" ? explainTransactionResultCode(code) : explainOperationResultCode(code, operationCategory);
}
