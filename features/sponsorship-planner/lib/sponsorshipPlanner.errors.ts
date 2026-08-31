import { classifyHorizonError } from "@/core/horizon/errors";
import type { SponsorshipPlannerErrorCode } from "@/features/sponsorship-planner/types";

/**
 * Maps transport failures onto this tool's error taxonomy.
 *
 * A 404 is handled inside the logic: a missing sponsored account is a plan
 * input (the normal sponsorship case), and a missing sponsor is reported as
 * `sponsor_not_found`. So this mapper only ever sees the remaining codes.
 */
export function toSponsorshipPlannerErrorCode(error: unknown): SponsorshipPlannerErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "sponsor_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
