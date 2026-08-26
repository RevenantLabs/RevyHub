import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AccountMergePreflightErrorCode, AccountMergePreflightInput } from "@/features/account-merge-preflight/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAccountMergePreflightInput(raw: string): Result<AccountMergePreflightInput, AccountMergePreflightErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
