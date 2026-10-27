import type { HorizonStreamSamplerErrorCode } from "@/features/horizon-stream-sampler/types";
export function toHorizonStreamSamplerErrorCode(_error: unknown): HorizonStreamSamplerErrorCode { return "stream_connection_failed"; }
