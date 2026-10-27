import { afterEach, describe, expect, it, vi } from "vitest";
import { openBoundedSse } from "../lib/sse-connection";

afterEach(() => vi.unstubAllGlobals());

function mockStream(block: string) {
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode(block)); },
    cancel,
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
  return { body, cancel };
}

describe("stream cleanup", () => {
  it("cancels and unlocks the response when event decoding fails", async () => {
    const { body, cancel } = mockStream("data: invalid-json\n\n");
    expect(await openBoundedSse("https://example.com/stream", { sampleSize: 2, durationMs: 1000 }, "testnet"))
      .toEqual({ ok: false, code: "malformed_event" });
    expect(cancel).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
  });

  it("releases the connection as soon as the event count is reached", async () => {
    const { body, cancel } = mockStream('id: 1\ndata: {"hash":"first"}\n\nid: 2\ndata: {"hash":"second"}\n\n');
    const result = await openBoundedSse("https://example.com/stream", { sampleSize: 1, durationMs: 1000 }, "testnet");
    expect(result.ok && result.value.events).toHaveLength(1);
    expect(result.ok && result.value.stopReason).toBe("sample-size");
    expect(cancel).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
  });
});
