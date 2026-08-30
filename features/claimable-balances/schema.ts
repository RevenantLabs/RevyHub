import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  ClaimableBalancesErrorCode,
  ClaimableBalancesField,
  ClaimableBalancesInput,
  ClaimableBalancesMode
} from "@/features/claimable-balances/types";

/** A claimable balance ID is 32 bytes rendered as 64 hex characters. */
const BALANCE_ID = /^[0-9a-fA-F]{64}$/;

export interface RawClaimableBalancesInput {
  mode: ClaimableBalancesMode;
  accountId: string;
  balanceId: string;
}

export const FIELD_OF_CODE: Record<ClaimableBalancesErrorCode, ClaimableBalancesField | null> = {
  empty_input: null,
  invalid_input: null,
  balance_not_found: null,
  rate_limited: null,
  request_failed: null
};

export function isLikelyBalanceId(value: string): boolean {
  return BALANCE_ID.test(value);
}

export function parseClaimableBalancesInput(
  raw: RawClaimableBalancesInput
): Result<ClaimableBalancesInput, ClaimableBalancesErrorCode> {
  const accountId = raw.accountId.replace(/\s+/g, "");
  const balanceId = raw.balanceId.replace(/\s+/g, "").toLowerCase();

  if (raw.mode === "account") {
    if (!accountId) return err("empty_input");
    if (accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) {
      return err("invalid_input");
    }
    return ok({ mode: "account", accountId });
  }

  if (!balanceId) return err("empty_input");
  if (!BALANCE_ID.test(balanceId)) return err("invalid_input");
  return ok({ mode: "balance", balanceId });
}
