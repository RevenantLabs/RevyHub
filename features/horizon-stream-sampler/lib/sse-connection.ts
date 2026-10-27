import { err, ok, type Result } from "@/core/result/result";
import { decodeSseEvent } from "@/features/horizon-stream-sampler/lib/event-decode";
import { completedReason, sampleBoundReached } from "@/features/horizon-stream-sampler/lib/bounded-sample";
import type { HorizonStreamSamplerErrorCode, HorizonStreamSamplerInput, HorizonStreamSamplerResult, SampledEvent } from "@/features/horizon-stream-sampler/types";
import type { StellarNetwork } from "@/core/network/types";
export async function openBoundedSse(url: string, input: HorizonStreamSamplerInput, network: StellarNetwork, signal?: AbortSignal, onEvent?: (event: SampledEvent) => void): Promise<Result<HorizonStreamSamplerResult, HorizonStreamSamplerErrorCode>> {
  const controller = new AbortController(); const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true }); if (signal?.aborted) abort();
  const timeout = setTimeout(abort, input.durationMs); const events: SampledEvent[] = [];
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(url, { headers: { Accept: "text/event-stream" }, signal: controller.signal });
    if (response.status === 429) return err("rate_limited");
    if (!response.ok || !response.body) return err("stream_connection_failed");
    reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
    while (!controller.signal.aborted) {
      const chunk = await reader.read(); if (chunk.done) break; buffer += decoder.decode(chunk.value, { stream: true });
      const blocks = buffer.split(/\r?\n\r?\n/); buffer = blocks.pop() ?? "";
      for (const block of blocks) { const decoded = decodeSseEvent(block); if (!decoded.ok) return decoded; if (decoded.value) { events.push(decoded.value); onEvent?.(decoded.value); } if (sampleBoundReached(events, input.sampleSize)) { controller.abort(); break; } }
    }
    const reason = sampleBoundReached(events, input.sampleSize) ? "sample-size" : signal?.aborted ? "manual" : "duration";
    return ok({ events, stopReason: completedReason(events, reason), network });
  } catch (error) {
    if (controller.signal.aborted) { const reason = signal?.aborted ? "manual" : "duration"; return ok({ events, stopReason: completedReason(events, reason), network }); }
    return err("stream_connection_failed");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
    controller.abort();
    await reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
  }
}
