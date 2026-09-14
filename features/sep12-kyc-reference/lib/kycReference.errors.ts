import type { Sep12ErrorCode } from "@/features/sep12-kyc-reference/types";

export interface Sep12Error {
  code: Sep12ErrorCode;
}

export function isSep12Error(e: unknown): e is Sep12Error {
  return typeof e === "object" && e !== null && "code" in e;
}
