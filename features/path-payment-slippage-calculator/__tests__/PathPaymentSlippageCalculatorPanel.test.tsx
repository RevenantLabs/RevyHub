import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { PathPaymentSlippageCalculatorPanel } from "@/features/path-payment-slippage-calculator/components/PathPaymentSlippageCalculatorPanel";
import { copy } from "@/features/path-payment-slippage-calculator/copy";

describe("PathPaymentSlippageCalculatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<PathPaymentSlippageCalculatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<PathPaymentSlippageCalculatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
