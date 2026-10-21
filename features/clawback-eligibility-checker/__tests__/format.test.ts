import { describe, expect, it } from "vitest";
import { formatVerdictLabel } from "../lib/format";

describe("formatVerdictLabel", () => {
  it("labels every verdict kind", () => {
    expect(formatVerdictLabel({ kind: "eligible" })).toBe("Clawback-eligible");
    expect(formatVerdictLabel({ kind: "not_eligible" })).toBe("Not clawback-eligible");
    expect(formatVerdictLabel({ kind: "disagreement", issuerSaysEnabled: true, holderSaysEnabled: false })).toBe("Signals disagree");
    expect(formatVerdictLabel({ kind: "unknown" })).toBe("Unknown — one or both lookups did not complete");
  });
});
