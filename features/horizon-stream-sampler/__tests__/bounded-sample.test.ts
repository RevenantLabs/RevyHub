import { describe, expect, it } from "vitest"; import { completedReason, sampleBoundReached } from "@/features/horizon-stream-sampler/lib/bounded-sample"; import { sampleEvents } from "@/features/horizon-stream-sampler/fixtures/sample-events.fixture";
describe("bounded sample", () => {
  it("stops at the event limit", () => expect(sampleBoundReached(sampleEvents, 2)).toBe(true));
  it("makes a no-event duration explicit", () => expect(completedReason([], "duration")).toBe("empty"));
});
