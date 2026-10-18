import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { DeadlineBoardErrorCode, DeadlineBoardInput } from "./types";

export function parseDeadlineBoardInput(raw: { claimant: string; cursor?: string }): Result<DeadlineBoardInput, DeadlineBoardErrorCode> {
  const claimant = raw.claimant.trim();
  const cursor = raw.cursor?.trim();
  if (claimant.startsWith("S") || !StrKey.isValidEd25519PublicKey(claimant)) return err("invalid_claimant");
  if (cursor && !/^\d{1,20}$/.test(cursor)) return err("invalid_cursor");
  return ok({ claimant, ...(cursor ? { cursor } : {}) });
}
