import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AccountDataEntriesErrorCode, AccountDataEntriesInput } from "@/features/account-data-entries/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAccountDataEntriesInput(raw: string): Result<AccountDataEntriesInput, AccountDataEntriesErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
