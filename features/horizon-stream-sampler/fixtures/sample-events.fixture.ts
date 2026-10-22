import type { SampledEvent } from "@/features/horizon-stream-sampler/types";
export const sampleEvents: SampledEvent[] = [
  { event: "message", id: "101", payload: { hash: "a".repeat(64), successful: true } },
  { event: "message", id: "102", payload: { hash: "b".repeat(64), successful: false } }
];
export const sampleEventBlock = `id: 101\nevent: message\ndata: {"hash":"${"a".repeat(64)}","successful":true}\n`;
