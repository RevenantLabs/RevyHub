import type { AccountDataEntriesErrorCode } from "../types";

export const ACCOUNT_DATA_ENTRIES_ERROR_MESSAGES: Record<AccountDataEntriesErrorCode, string> = {
  empty_input: "Account ID is required.",
  invalid_account_id: "Invalid Ed25519 public key format.",
  account_not_found: "Account not found on the network.",
  request_failed: "Failed to fetch account data entries."
};
