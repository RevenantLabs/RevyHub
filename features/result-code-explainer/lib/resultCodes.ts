import type { CodeExplanation, ResultCodeCategory } from "@/features/result-code-explainer/types";

type CodeRow = Omit<CodeExplanation, "known">;

const TRANSACTION: ResultCodeCategory = "transaction";
const OPERATION: ResultCodeCategory = "operation";

/** Curated Stellar transaction and operation result codes with plain-English guidance. */
export const RESULT_CODE_TABLE: Record<string, CodeRow> = {
  tx_success: {
    code: "tx_success",
    category: TRANSACTION,
    title: "Transaction succeeded",
    cause: "Every operation in the transaction executed and the fee was charged.",
    fix: "No action needed. Use the transaction hash as on-chain proof of settlement."
  },
  tx_failed: {
    code: "tx_failed",
    category: TRANSACTION,
    title: "Transaction failed",
    cause: "At least one operation failed. Earlier operations may still have applied; later ones were skipped.",
    fix: "Read the operation-level codes below, fix the failing step, rebuild the transaction, and submit again."
  },
  tx_too_early: {
    code: "tx_too_early",
    category: TRANSACTION,
    title: "Submitted before the time bound",
    cause: "The transaction declares a minimum time that has not arrived yet.",
    fix: "Wait until the min-time precondition is satisfied, or rebuild without overly restrictive time bounds."
  },
  tx_too_late: {
    code: "tx_too_late",
    category: TRANSACTION,
    title: "Submitted after the time bound",
    cause: "The transaction's max-time precondition has already passed.",
    fix: "Rebuild the transaction with a fresh time window and a current sequence number."
  },
  tx_missing_operation: {
    code: "tx_missing_operation",
    category: TRANSACTION,
    title: "No operations in the envelope",
    cause: "The transaction envelope contains zero operations.",
    fix: "Add at least one operation before signing and submitting."
  },
  tx_bad_seq: {
    code: "tx_bad_seq",
    category: TRANSACTION,
    title: "Sequence number mismatch",
    cause: "The sequence number in the envelope does not match the source account's current sequence on the ledger.",
    fix: "Fetch the account's latest sequence from Horizon and rebuild the transaction with sequence + 1."
  },
  tx_bad_auth: {
    code: "tx_bad_auth",
    category: TRANSACTION,
    title: "Missing or invalid signatures",
    cause: "The envelope is not signed by every required key — typically the source account or an extra signer declared in preconditions.",
    fix: "Sign with the source account secret (or all required signers) using the correct network passphrase."
  },
  tx_insufficient_balance: {
    code: "tx_insufficient_balance",
    category: TRANSACTION,
    title: "Source account cannot pay the fee",
    cause: "The fee-paying account does not hold enough XLM to cover the declared transaction fee.",
    fix: "Fund the fee source with more XLM, or lower the fee if the network minimum allows it."
  },
  tx_no_account: {
    code: "tx_no_account",
    category: TRANSACTION,
    title: "Source account does not exist",
    cause: "The source public key in the envelope has never received a create-account operation on this network.",
    fix: "Fund and create the account first, or verify you are on the intended network (testnet vs mainnet)."
  },
  tx_insufficient_fee: {
    code: "tx_insufficient_fee",
    category: TRANSACTION,
    title: "Fee below the network minimum",
    cause: "The declared fee is lower than the ledger requires for this transaction size.",
    fix: "Raise the fee to at least the base fee times the number of operations, then rebuild."
  },
  tx_bad_auth_extra: {
    code: "tx_bad_auth_extra",
    category: TRANSACTION,
    title: "Too many signatures attached",
    cause: "The envelope carries signatures that are not required and are not recognised for this transaction.",
    fix: "Remove extra signatures or verify you are using the intended envelope bytes when signing."
  },
  tx_internal_error: {
    code: "tx_internal_error",
    category: TRANSACTION,
    title: "Internal ledger error",
    cause: "The network hit an unexpected condition while applying the transaction.",
    fix: "Retry later. If it persists, check Stellar status channels — this is not caused by your operation parameters."
  },
  tx_not_supported: {
    code: "tx_not_supported",
    category: TRANSACTION,
    title: "Unsupported transaction version",
    cause: "The envelope uses a protocol feature this ledger version does not implement.",
    fix: "Update your SDK, confirm protocol support on the target network, or simplify the transaction."
  },
  tx_bad_sponsorship: {
    code: "tx_bad_sponsorship",
    category: TRANSACTION,
    title: "Sponsorship rules violated",
    cause: "A reserve or entry would exceed sponsor limits, or a sponsoring account cannot cover the liability.",
    fix: "Check sponsor balances and sponsorship counts, or end sponsorship before deleting sponsored entries."
  },
  tx_bad_min_seq_age_or_gap: {
    code: "tx_bad_min_seq_age_or_gap",
    category: TRANSACTION,
    title: "Minimum sequence precondition not met",
    cause: "The transaction requires a minimum sequence age or ledger gap that has not elapsed yet.",
    fix: "Wait for more ledgers to close, or rebuild without the restrictive min-sequence preconditions."
  },
  tx_malformed: {
    code: "tx_malformed",
    category: TRANSACTION,
    title: "Malformed transaction",
    cause: "The envelope structure is invalid — for example impossible bounds or inconsistent fields.",
    fix: "Rebuild the transaction with a current SDK and validate the envelope before signing."
  },
  tx_soroban_invalid: {
    code: "tx_soroban_invalid",
    category: TRANSACTION,
    title: "Invalid Soroban transaction",
    cause: "The Soroban extension or resource declaration on this transaction is invalid.",
    fix: "Simulate the contract call, refresh footprint and resource fees, then rebuild the Soroban transaction."
  },
  tx_fee_bump_inner_success: {
    code: "tx_fee_bump_inner_success",
    category: TRANSACTION,
    title: "Fee bump succeeded",
    cause: "The outer fee-bump wrapper paid a higher fee and the inner transaction executed successfully.",
    fix: "No action needed on the inner transaction."
  },
  tx_fee_bump_inner_failed: {
    code: "tx_fee_bump_inner_failed",
    category: TRANSACTION,
    title: "Fee bump inner transaction failed",
    cause: "The fee bump was accepted but the wrapped inner transaction failed.",
    fix: "Inspect the inner transaction result codes and fix the underlying operation failure."
  },
  op_bad_auth: {
    code: "op_bad_auth",
    category: OPERATION,
    title: "Operation not authorised",
    cause: "The operation requires a signature that was not provided — common with multi-sign or cosign layouts.",
    fix: "Add the missing signature for this operation's source account or declared extra signers."
  },
  op_no_account: {
    code: "op_no_account",
    category: OPERATION,
    title: "Operation source missing",
    cause: "The operation references a source account that does not exist on this ledger.",
    fix: "Create and fund the account, or point the operation at an existing public key."
  },
  op_not_supported: {
    code: "op_not_supported",
    category: OPERATION,
    title: "Operation type not supported",
    cause: "This ledger version does not support the operation type encoded in the transaction.",
    fix: "Upgrade validators/SDK or remove the unsupported operation from the batch."
  },
  op_too_many_subentries: {
    code: "op_too_many_subentries",
    category: OPERATION,
    title: "Subentry limit reached",
    cause: "The account already holds the maximum number of trustlines, offers, or data entries.",
    fix: "Remove unused trustlines or offers, or merge subentries before adding new ones."
  },
  op_exceeded_work_limit: {
    code: "op_exceeded_work_limit",
    category: OPERATION,
    title: "Work limit exceeded",
    cause: "Applying this operation would exceed the ledger's per-transaction work meter.",
    fix: "Split heavy work across multiple transactions or reduce the operation's footprint."
  },
  op_too_many_sponsoring: {
    code: "op_too_many_sponsoring",
    category: OPERATION,
    title: "Too many sponsored entries",
    cause: "The sponsoring account is at its limit for entries it sponsors.",
    fix: "End sponsorship on unused entries or use a sponsor with available capacity."
  },
  payment_underfunded: {
    code: "payment_underfunded",
    category: OPERATION,
    operationType: "payment",
    title: "Payment source lacks balance",
    cause: "The paying account does not hold enough of the asset being sent.",
    fix: "Check the source account balance for that asset (XLM or trustline) and lower the amount or fund the account."
  },
  payment_no_trust: {
    code: "payment_no_trust",
    category: OPERATION,
    operationType: "payment",
    title: "Destination has no trustline",
    cause: "The recipient has not established a trustline to the asset issuer.",
    fix: "Ask the recipient to add a trustline to the asset, or pay in XLM instead."
  },
  payment_not_authorized: {
    code: "payment_not_authorized",
    category: OPERATION,
    operationType: "payment",
    title: "Destination not authorised for asset",
    cause: "The asset requires authorisation and the destination trustline is not authorised.",
    fix: "Have the issuer authorise the destination trustline before sending."
  },
  payment_src_no_trust: {
    code: "payment_src_no_trust",
    category: OPERATION,
    operationType: "payment",
    title: "Source has no trustline",
    cause: "The sending account has no trustline to the asset being paid.",
    fix: "Add a trustline on the source account or choose an asset the source already holds."
  },
  payment_line_full: {
    code: "payment_line_full",
    category: OPERATION,
    operationType: "payment",
    title: "Trustline limit reached",
    cause: "The destination trustline has a limit and this payment would exceed it.",
    fix: "Raise the trustline limit on the destination or send a smaller amount."
  },
  payment_no_destination: {
    code: "payment_no_destination",
    category: OPERATION,
    operationType: "payment",
    title: "Destination account missing",
    cause: "The payment targets an account that does not exist.",
    fix: "Create the destination account first or verify the destination address."
  },
  change_trust_low_reserve: {
    code: "change_trust_low_reserve",
    category: OPERATION,
    operationType: "change_trust",
    title: "Not enough XLM for new trustline reserve",
    cause: "Adding the trustline requires a base reserve the account cannot spare.",
    fix: "Fund the account with more XLM before adding the trustline."
  },
  change_trust_trust_line_missing: {
    code: "change_trust_trust_line_missing",
    category: OPERATION,
    operationType: "change_trust",
    title: "Trustline does not exist",
    cause: "The operation expects an existing trustline that is not on the ledger.",
    fix: "Create the trustline first, or verify the asset code and issuer."
  },
  manage_buy_offer_underfunded: {
    code: "manage_buy_offer_underfunded",
    category: OPERATION,
    operationType: "manage_buy_offer",
    title: "Buy offer lacks selling asset",
    cause: "The account does not hold enough of the asset it is offering to sell.",
    fix: "Fund the selling asset balance or reduce the offer size."
  },
  manage_sell_offer_underfunded: {
    code: "manage_sell_offer_underfunded",
    category: OPERATION,
    operationType: "manage_sell_offer",
    title: "Sell offer lacks selling asset",
    cause: "The account does not hold enough of the asset listed in the sell offer.",
    fix: "Fund the asset or lower the offer amount."
  },
  create_account_low_reserve: {
    code: "create_account_low_reserve",
    category: OPERATION,
    operationType: "create_account",
    title: "Starting balance below minimum",
    cause: "The initial deposit is below the account's minimum balance requirement.",
    fix: "Increase the starting balance to at least the base reserve for a new account."
  },
  account_merge_no_trust: {
    code: "account_merge_no_trust",
    category: OPERATION,
    operationType: "account_merge",
    title: "Cannot merge while non-XLM balances remain",
    cause: "The account still holds trustlines or non-native assets.",
    fix: "Remove trustlines, sell or transfer assets, and cancel offers before merging."
  },
  invoke_host_function_trapped: {
    code: "invoke_host_function_trapped",
    category: OPERATION,
    operationType: "invoke_host_function",
    title: "Contract call trapped",
    cause: "The Soroban contract returned a failure or hit a host trap during execution.",
    fix: "Simulate the call locally, read contract error codes, and fix arguments or authorisation."
  },
  bump_sequence_bad_seq: {
    code: "bump_sequence_bad_seq",
    category: OPERATION,
    operationType: "bump_sequence",
    title: "Bump sequence target too low",
    cause: "The requested new sequence is not higher than the account's current sequence.",
    fix: "Set bumpTo to a value greater than the current on-ledger sequence."
  }
};

/** Common shorthand aliases users paste from logs or docs. */
export const RESULT_CODE_ALIASES: Record<string, string> = {
  op_underfunded: "payment_underfunded",
  op_no_trust: "payment_no_trust",
  underfunded: "payment_underfunded",
  no_trust: "payment_no_trust"
};

export function normalizeResultCode(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function lookupResultCode(raw: string): CodeExplanation {
  const normalized = normalizeResultCode(raw);
  const canonical = RESULT_CODE_ALIASES[normalized] ?? normalized;
  const row = RESULT_CODE_TABLE[canonical];

  if (row) {
    return { ...row, known: true };
  }

  return {
    code: normalized,
    category: normalized.startsWith("tx_") ? TRANSACTION : OPERATION,
    title: "Unknown result code",
    cause: "This code is not in the curated table shipped with RevyHub.",
    fix: "Double-check the spelling, decode the result XDR instead, or consult the Stellar protocol docs for the exact enum name.",
    known: false
  };
}

export function allKnownCodes(): CodeExplanation[] {
  return Object.values(RESULT_CODE_TABLE).map((row) => ({ ...row, known: true }));
}
