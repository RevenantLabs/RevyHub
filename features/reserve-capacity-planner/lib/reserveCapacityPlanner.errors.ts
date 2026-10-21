import type { ReserveCapacityPlannerErrorCode } from "@/features/reserve-capacity-planner/types";

/**
 * Maps an unexpected throw onto this slice's code.
 * The message is read only so it can be discarded; it may contain a pasted secret.
 */
export function toReserveCapacityPlannerErrorCode(error: unknown): ReserveCapacityPlannerErrorCode {
  if (error instanceof Error) return "unexpected_failure";
  return "unexpected_failure";
}
