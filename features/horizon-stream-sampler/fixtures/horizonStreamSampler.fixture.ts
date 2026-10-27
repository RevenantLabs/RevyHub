import { sampleEvents } from "@/features/horizon-stream-sampler/fixtures/sample-events.fixture"; import type { HorizonStreamSamplerResult } from "@/features/horizon-stream-sampler/types";
export const horizonStreamSamplerFixture: HorizonStreamSamplerResult = { events: sampleEvents, stopReason: "sample-size", network: "testnet" };
