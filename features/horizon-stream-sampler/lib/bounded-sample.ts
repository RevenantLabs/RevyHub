import type { SampledEvent, StopReason } from "@/features/horizon-stream-sampler/types";
export function sampleBoundReached(events: SampledEvent[], limit: number): boolean { return events.length >= limit; }
export function completedReason(events: SampledEvent[], reason: Exclude<StopReason, "empty">): StopReason { return events.length === 0 ? "empty" : reason; }
