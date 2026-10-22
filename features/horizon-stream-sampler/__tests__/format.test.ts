import { describe, expect, it } from "vitest"; import { formatEventPayload } from "@/features/horizon-stream-sampler/lib/format";
describe("event formatting", () => { it("pretty prints decoded JSON", () => expect(formatEventPayload({ ledger: 42 })).toBe('{\n  "ledger": 42\n}')); });
