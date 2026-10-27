import { describe, expect, it } from "vitest"; import { decodeSseEvent } from "@/features/horizon-stream-sampler/lib/event-decode"; import { sampleEventBlock } from "@/features/horizon-stream-sampler/fixtures/sample-events.fixture";
describe("decodeSseEvent", () => {
  it("decodes type, id and JSON payload", () => { const result = decodeSseEvent(sampleEventBlock); expect(result.ok && result.value?.id).toBe("101"); });
  it("reports malformed JSON", () => expect(decodeSseEvent("data: nope")).toEqual({ ok: false, code: "malformed_event" }));
});
