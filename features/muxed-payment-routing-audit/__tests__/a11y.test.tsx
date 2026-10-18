import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { MuxedPaymentRoutingAuditPanel } from "@/features/muxed-payment-routing-audit/components/MuxedPaymentRoutingAuditPanel";
import { handlers } from "@/features/muxed-payment-routing-audit/msw/handlers";
import { baseAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
import { copy } from "@/features/muxed-payment-routing-audit/copy";
withMswHandlers(...handlers);
describe("WCAG 2.1 A/AA", () => {
  it("has no violations while idle", async () => { const { container } = renderFeature(<MuxedPaymentRoutingAuditPanel />); await expectNoAxeViolations(container); });
  it("has no violations with grouped results", async () => {
    const { container, user } = renderFeature(<MuxedPaymentRoutingAuditPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), baseAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.coverageTitle);
    await expectNoAxeViolations(container);
  });
});
