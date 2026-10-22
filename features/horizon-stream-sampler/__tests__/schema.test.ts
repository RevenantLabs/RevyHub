import { describe, expect, it } from "vitest"; import { parseHorizonStreamSamplerInput } from "@/features/horizon-stream-sampler/schema";
describe("parseHorizonStreamSamplerInput", () => {
  it("accepts bounded size and duration", () => expect(parseHorizonStreamSamplerInput("5,10")).toEqual({ ok: true, value: { sampleSize: 5, durationMs: 10000 } }));
  it("rejects an excessive event count", () => expect(parseHorizonStreamSamplerInput("26,10")).toEqual({ ok: false, code: "invalid_sample_bound" }));
  it("rejects an excessive duration", () => expect(parseHorizonStreamSamplerInput("5,31")).toEqual({ ok: false, code: "invalid_sample_bound" }));
});
