import { describe, expect, it } from "vitest";
import {
  buildSummaryText,
  formatNetworkLabel,
  formatRange,
  formatRunLabel,
  formatTransitionLabel
} from "@/features/ledger-protocol-transition-map/lib/format";

describe("format helpers", () => {
  it("labels networks and ranges", () => {
    expect(formatNetworkLabel("testnet")).toBe("Testnet");
    expect(formatRange("1000", "1003")).toBe("#1000 → #1003");
  });

  it("formats runs and transitions", () => {
    expect(
      formatRunLabel({
        protocolVersion: "21",
        startSequence: "1002",
        endSequence: "1003",
        ledgerCount: "2"
      })
    ).toBe("v21 · #1002 → #1003 (2)");

    expect(
      formatTransitionLabel({
        fromVersion: "20",
        toVersion: "21",
        beforeSequence: "1001",
        afterSequence: "1002",
        certainty: "exact",
        reason: "adjacent"
      })
    ).toBe("v20 → v21 at #1001/#1002");
  });

  it("builds a copyable summary", () => {
    expect(
      buildSummaryText({
        network: "testnet",
        start: "1000",
        end: "1003",
        observed: 4,
        transitions: [
          {
            fromVersion: "20",
            toVersion: "21",
            beforeSequence: "1001",
            afterSequence: "1002",
            certainty: "exact",
            reason: "adjacent"
          }
        ]
      })
    ).toContain("exact:20->21@1001/1002");
  });
});
