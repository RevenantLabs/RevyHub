import { describe, expect, it } from "vitest"; import { formatEventCount } from "@/features/horizon-stream-sampler/lib/format";
describe("Horizon stream result", () => { it("uses an explicit event count", () => { expect(formatEventCount(0)).toBe("0 events"); expect(formatEventCount(1)).toBe("1 event"); }); });
