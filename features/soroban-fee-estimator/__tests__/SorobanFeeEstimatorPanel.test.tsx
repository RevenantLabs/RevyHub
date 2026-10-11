import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SorobanFeeEstimatorPanel } from "@/features/soroban-fee-estimator/components/SorobanFeeEstimatorPanel";
import { copy } from "@/features/soroban-fee-estimator/copy";

describe("SorobanFeeEstimatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SorobanFeeEstimatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SorobanFeeEstimatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
