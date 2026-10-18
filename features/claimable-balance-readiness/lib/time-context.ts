import { err, ok, type Result } from "@/core/result/result";
import type { TimeContextSummary } from "@/features/claimable-balance-readiness/types";

export interface EvaluationTimeContext {
  evaluationMs: number;
  evaluationIso: string;
  creationMs: number | null;
  creationIso: string | null;
  creationReliable: boolean;
  creationSource: "last_modified_time" | "unavailable";
}

/**
 * Resolve absolute evaluation time and relative-time creation context.
 * Relative predicates need a reliable creation timestamp; when Horizon does
 * not provide a parseable last_modified_time, creationReliable is false.
 */
export function resolveTimeContext(
  evaluationTimeIso: string,
  lastModifiedTime?: string
): Result<EvaluationTimeContext, "invalid_time"> {
  const evaluationMs = Date.parse(evaluationTimeIso);
  if (Number.isNaN(evaluationMs)) {
    return err("invalid_time");
  }

  const evaluationIso = new Date(evaluationMs).toISOString().replace(".000Z", "Z");

  if (!lastModifiedTime) {
    return ok({
      evaluationMs,
      evaluationIso,
      creationMs: null,
      creationIso: null,
      creationReliable: false,
      creationSource: "unavailable"
    });
  }

  const creationMs = Date.parse(lastModifiedTime);
  if (Number.isNaN(creationMs)) {
    return ok({
      evaluationMs,
      evaluationIso,
      creationMs: null,
      creationIso: null,
      creationReliable: false,
      creationSource: "unavailable"
    });
  }

  return ok({
    evaluationMs,
    evaluationIso,
    creationMs,
    creationIso: new Date(creationMs).toISOString().replace(".000Z", "Z"),
    creationReliable: true,
    creationSource: "last_modified_time"
  });
}

export function toTimeContextSummary(context: EvaluationTimeContext): TimeContextSummary {
  return {
    evaluationTime: context.evaluationIso,
    evaluationTimeMs: context.evaluationMs,
    creationTime: context.creationIso,
    creationTimeMs: context.creationMs,
    creationReliable: context.creationReliable,
    creationSource: context.creationSource
  };
}
