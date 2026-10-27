import type { StellarNetwork } from "@/core/network/types";
export interface HorizonStreamSamplerInput { sampleSize: number; durationMs: number }
export interface SampledEvent { event: string; id: string | null; payload: unknown }
export type StopReason = "sample-size" | "duration" | "manual" | "empty";
export interface HorizonStreamSamplerResult { events: SampledEvent[]; stopReason: StopReason; network: StellarNetwork }
export type HorizonStreamSamplerErrorCode = "invalid_sample_bound" | "stream_connection_failed" | "malformed_event" | "rate_limited";
