import { classifyHorizonError } from "@/core/horizon/errors";
import type { SponsoredReservesErrorCode } from "@/features/sponsored-reserves/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSponsoredReservesErrorCode(error: unknown): SponsoredReservesErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
