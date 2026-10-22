import type { HorizonStreamSamplerErrorCode, StopReason } from "@/features/horizon-stream-sampler/types";
export const copy = {
  sampleSizeLabel: "Maximum events", sampleSizeHint: "Choose 1–25 events.",
  durationLabel: "Maximum duration (seconds)", durationHint: "Choose 1–30 seconds.",
  submit: "Start sample", working: "Connecting…", stop: "Stop stream",
  emptyTitle: "No stream sampled", emptyDescription: "Choose tight bounds to watch public transaction events briefly.",
  resultTitle: "Sampled events", connected: "Connected", disconnected: "Disconnected",
  emptySample: "The bound ended before Horizon delivered an event.", eventType: "Event type", payload: "Decoded payload"
} as const;
export const stopReasonCopy: Record<StopReason, string> = {
  "sample-size": "The event limit was reached.", duration: "The duration limit was reached.",
  manual: "The stream was stopped manually.", empty: copy.emptySample
};
export const errorCopy: Record<HorizonStreamSamplerErrorCode, { title: string; description: string }> = {
  invalid_sample_bound: { title: "Sample bounds are invalid", description: "Choose 1–25 events and a duration of 1–30 seconds." },
  stream_connection_failed: { title: "Stream could not connect", description: "Check the selected network and connection, then retry." },
  malformed_event: { title: "A stream event was malformed", description: "Horizon returned an event payload that could not be decoded as JSON." },
  rate_limited: { title: "Horizon rate limit reached", description: "Wait briefly before opening another sample." }
};
