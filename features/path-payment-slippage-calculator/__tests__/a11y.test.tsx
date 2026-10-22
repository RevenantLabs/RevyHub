import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { PathPaymentSlippageCalculatorPanel } from "@/features/path-payment-slippage-calculator/components/PathPaymentSlippageCalculatorPanel";
import { copy } from "@/features/path-payment-slippage-calculator/copy";

describe("PathPaymentSlippageCalculatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PathPaymentSlippageCalculatorPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG A/AA violations after validation", async () => {
    const { container, user } = renderFeature(<PathPaymentSlippageCalculatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });
});
