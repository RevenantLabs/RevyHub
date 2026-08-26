import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountDataEntriesErrorCode } from "@/features/account-data-entries/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAccountDataEntriesErrorCode(error: unknown): AccountDataEntriesErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
