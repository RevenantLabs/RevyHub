import { describe, expect, it } from "vitest";
import { documentedStatuses, explainStatus } from "@/features/sep24-transaction-status-tracker/lib/status-explanations";

describe("explainStatus", () => {
  it("explains every documented SEP-24 status", () => {
    for (const status of documentedStatuses()) {
      const explanation = explainStatus(status);
      expect(explanation.documented).toBe(true);
      expect(explanation.nextStep.length).toBeGreaterThan(0);
    }
    expect(documentedStatuses()).toEqual(
      expect.arrayContaining([
        "incomplete",
        "pending_user_transfer_start",
        "pending_external",
        "pending_anchor",
        "pending_stellar",
        "pending_trust",
        "pending_user",
        "on_hold",
        "completed",
        "refunded",
        "expired",
        "error",
        "no_market",
        "too_small",
        "too_large"
      ])
    );
  });

  it("does not invent guidance for an unknown status", () => {
    expect(explainStatus("made_up").documented).toBe(false);
  });
});
