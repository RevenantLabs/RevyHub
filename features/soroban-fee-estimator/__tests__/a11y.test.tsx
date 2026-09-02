import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SorobanFeeEstimatorPanel } from "@/features/soroban-fee-estimator/components/SorobanFeeEstimatorPanel";

describe("SorobanFeeEstimatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SorobanFeeEstimatorPanel />);
    await expectNoAxeViolations(container);
  });
});
