import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { PaymentReceiptReconcilerPanel } from "@/features/payment-receipt-reconciler/components/PaymentReceiptReconcilerPanel";
import { copy } from "@/features/payment-receipt-reconciler/copy";
import { handlers } from "@/features/payment-receipt-reconciler/msw/handlers";
import { successfulHash } from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

withMswHandlers(...handlers);

describe("PaymentReceiptReconcilerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PaymentReceiptReconcilerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a reconciled receipt", async () => {
    const { container, user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), successfulHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.publicReceiptTitle);

    await expectNoAxeViolations(container);
  });
});
