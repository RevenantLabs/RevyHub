import { describe, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { LiquidityPoolCalculatorPanel } from "@/features/liquidity-pool-calculator/components/LiquidityPoolCalculatorPanel";
import { copy } from "@/features/liquidity-pool-calculator/copy";
import { poolId } from "@/features/liquidity-pool-calculator/fixtures/liquidityPoolCalculator.fixture";
import { handlers } from "@/features/liquidity-pool-calculator/msw/handlers";

withMswHandlers(...handlers);

describe("LiquidityPoolCalculatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<LiquidityPoolCalculatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no violations with a result rendered", async () => {
    const { container, user } = renderFeature(<LiquidityPoolCalculatorPanel />);
    fireEvent.change(screen.getByLabelText(copy.formLabel), { target: { value: JSON.stringify({ poolId, action: "deposit", amountA: "100", amountB: "25" }) } });
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.depositTitle);
    await expectNoAxeViolations(container);
  });
});
