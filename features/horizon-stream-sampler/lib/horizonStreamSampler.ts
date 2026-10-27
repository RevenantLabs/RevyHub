import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { openBoundedSse } from "@/features/horizon-stream-sampler/lib/sse-connection";
import type { HorizonStreamSamplerInput, SampledEvent } from "@/features/horizon-stream-sampler/types";
export function runHorizonStreamSampler(input: HorizonStreamSamplerInput, network: StellarNetwork, signal?: AbortSignal, onEvent?: (event: SampledEvent) => void) {
  return openBoundedSse(horizonUrl(network, "/transactions", { cursor: "now" }), input, network, signal, onEvent);
}
