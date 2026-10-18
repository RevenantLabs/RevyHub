import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { PaymentQrPanel } from "@/features/payment-qr/components/PaymentQrPanel";
import { copy } from "@/features/payment-qr/copy";
import { destination } from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("PaymentQrPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PaymentQrPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a generated QR code", async () => {
    const { container, user } = renderFeature(<PaymentQrPanel />);

    await user.type(screen.getByLabelText(copy.destinationLabel), destination);
    await user.type(screen.getByLabelText(copy.amountLabel), "10.5");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("img", { name: copy.qrAlt });

    await expectNoAxeViolations(container);
  });
});
