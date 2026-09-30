import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { PaymentMemoPolicyCheckerPanel } from "@/features/payment-memo-policy-checker/components/PaymentMemoPolicyCheckerPanel";
import { copy } from "@/features/payment-memo-policy-checker/copy";

describe("PaymentMemoPolicyCheckerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<PaymentMemoPolicyCheckerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<PaymentMemoPolicyCheckerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
