import { describe, expect, it } from "vitest";
import {
  filterExplanations,
  formatCategory,
  formatCodeLabel,
  formatFeeCharged,
  formatOperationHeading
} from "@/features/result-code-explainer/lib/format";
import { resultCodeExplainerFixture } from "@/features/result-code-explainer/fixtures/resultCodeExplainer.fixture";

describe("formatCategory", () => {
  it("labels transaction and operation codes", () => {
    expect(formatCategory("transaction")).toBe("Transaction");
    expect(formatCategory("operation")).toBe("Operation");
  });
});

describe("formatCodeLabel", () => {
  it("includes the operation type when present", () => {
    const entry = resultCodeExplainerFixture.explanations[0]!;
    expect(formatCodeLabel(entry)).toBe("payment_underfunded (payment)");
  });
});

describe("formatOperationHeading", () => {
  it("numbers operations and names their type", () => {
    expect(formatOperationHeading(0, "payment")).toBe("Operation #1 — payment");
    expect(formatOperationHeading(2, null)).toBe("Operation #3");
  });
});

describe("formatFeeCharged", () => {
  it("appends stroops", () => {
    expect(formatFeeCharged("100")).toBe("100 stroops");
  });
});

describe("filterExplanations", () => {
  it("returns all entries when search is empty", () => {
    expect(filterExplanations(resultCodeExplainerFixture.explanations, "")).toHaveLength(1);
  });

  it("filters by cause text", () => {
    const filtered = filterExplanations(resultCodeExplainerFixture.explanations, "zzzznomatch");
    expect(filtered).toHaveLength(0);
  });
});
