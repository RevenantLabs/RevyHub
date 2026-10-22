import { err, ok, type Result } from "@/core/result/result";
import type { HorizonStreamSamplerErrorCode, HorizonStreamSamplerInput } from "@/features/horizon-stream-sampler/types";
export const SAMPLE_SIZE_LIMIT = 25;
export const DURATION_LIMIT_SECONDS = 30;
export function parseHorizonStreamSamplerInput(raw: string): Result<HorizonStreamSamplerInput, HorizonStreamSamplerErrorCode> {
  const [sizeText, durationText] = raw.split(",").map((part) => part.trim());
  const sampleSize = Number(sizeText); const durationSeconds = Number(durationText);
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > SAMPLE_SIZE_LIMIT || !Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > DURATION_LIMIT_SECONDS) return err("invalid_sample_bound");
  return ok({ sampleSize, durationMs: durationSeconds * 1000 });
}
