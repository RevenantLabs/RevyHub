import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { LiquidityPoolCalculatorPanel } from "@/features/liquidity-pool-calculator/components/LiquidityPoolCalculatorPanel";
import { copy } from "@/features/liquidity-pool-calculator/copy";

describe("LiquidityPoolCalculatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<LiquidityPoolCalculatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<LiquidityPoolCalculatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
