import type { HorizonPaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

export interface HorizonPaginationError {
  code: HorizonPaginationErrorCode;
}

export function isHorizonPaginationError(e: unknown): e is HorizonPaginationError {
  return typeof e === "object" && e !== null && "code" in e;
}
