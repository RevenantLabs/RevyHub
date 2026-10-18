import { describe, expect, it } from "vitest";
import { resolveTimeContext, toTimeContextSummary } from "@/features/claimable-balance-readiness/lib/time-context";
import {
  creationIso,
  evaluationInsideHour
} from "@/features/claimable-balance-readiness/fixtures/relative-time.fixture";

describe("resolveTimeContext", () => {
  it("rejects an unparseable evaluation time", () => {
    expect(resolveTimeContext("not-a-time", creationIso)).toEqual({
      ok: false,
      code: "invalid_time"
    });
  });

  it("marks creation as reliable when last_modified_time parses", () => {
    const result = resolveTimeContext(evaluationInsideHour, creationIso);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.creationReliable).toBe(true);
    expect(result.value.creationSource).toBe("last_modified_time");
    expect(result.value.creationIso).toBe(creationIso);
  });

  it("marks creation as unreliable when last_modified_time is missing", () => {
    const result = resolveTimeContext(evaluationInsideHour, undefined);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.creationReliable).toBe(false);
    expect(result.value.creationSource).toBe("unavailable");
    expect(result.value.creationMs).toBeNull();
  });

  it("marks creation as unreliable when last_modified_time is garbage", () => {
    const result = resolveTimeContext(evaluationInsideHour, "not-a-timestamp");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.creationReliable).toBe(false);
  });

  it("maps to a TimeContextSummary for the result payload", () => {
    const result = resolveTimeContext(evaluationInsideHour, creationIso);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const summary = toTimeContextSummary(result.value);
    expect(summary.evaluationTime).toBe(evaluationInsideHour);
    expect(summary.creationReliable).toBe(true);
  });
});
