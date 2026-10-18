import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  ClaimableBalanceReadinessErrorCode,
  ClaimableBalanceReadinessField,
  ClaimableBalanceReadinessInput
} from "@/features/claimable-balance-readiness/types";

/** A claimable balance ID is 32 bytes rendered as 64 hex characters. */
const BALANCE_ID = /^[0-9a-fA-F]{64}$/;

export interface RawClaimableBalanceReadinessInput {
  balanceId: string;
  claimant: string;
  evaluationTime: string;
}

export const FIELD_OF_CODE: Record<
  ClaimableBalanceReadinessErrorCode,
  ClaimableBalanceReadinessField | null
> = {
  invalid_balance_id: "balanceId",
  invalid_claimant: "claimant",
  invalid_time: "evaluationTime",
  balance_not_found: null,
  unsupported_predicate: null,
  request_failed: null
};

export function isLikelyBalanceId(value: string): boolean {
  return BALANCE_ID.test(value);
}

function parseUtcInstant(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Require an explicit UTC marker so local-only datetimes are rejected.
  if (!/[zZ]$/.test(trimmed) && !/[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return null;
  }

  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;

  return new Date(ms).toISOString().replace(".000Z", "Z");
}

/** Validates balance ID, claimant and evaluation time without contacting Horizon. */
export function parseClaimableBalanceReadinessInput(
  raw: RawClaimableBalanceReadinessInput
): Result<ClaimableBalanceReadinessInput, ClaimableBalanceReadinessErrorCode> {
  const balanceId = raw.balanceId.replace(/\s+/g, "").toLowerCase();
  const claimant = raw.claimant.replace(/\s+/g, "");
  const evaluationTimeRaw = raw.evaluationTime.trim();

  if (!balanceId || !BALANCE_ID.test(balanceId)) {
    return err("invalid_balance_id");
  }

  if (!claimant || claimant.startsWith("S") || !StrKey.isValidEd25519PublicKey(claimant)) {
    return err("invalid_claimant");
  }

  const evaluationTime = parseUtcInstant(evaluationTimeRaw);
  if (!evaluationTime) {
    return err("invalid_time");
  }

  return ok({ balanceId, claimant, evaluationTime });
}
