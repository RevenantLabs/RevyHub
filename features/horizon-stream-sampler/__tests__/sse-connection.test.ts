import { describe, expect, it } from "vitest"; import { decodeSseEvent } from "@/features/horizon-stream-sampler/lib/event-decode";
describe("SSE connection contract", () => { it("ignores heartbeat comments", () => expect(decodeSseEvent(": keepalive")).toEqual({ ok: true, value: null })); });
