import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { MuxedPaymentRoutingAuditPanel } from "@/features/muxed-payment-routing-audit/components/MuxedPaymentRoutingAuditPanel";
import { copy, errorCopy } from "@/features/muxed-payment-routing-audit/copy";
import { handlers } from "@/features/muxed-payment-routing-audit/msw/handlers";
import { baseAccount, missingAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
withMswHandlers(...handlers);
describe("audit panel", () => {
  it("shows guidance and a field error without echoing a secret", async () => {
    const { user, container } = renderFeature(<MuxedPaymentRoutingAuditPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await user.type(screen.getByLabelText(copy.formLabel), "SSECRETSEED");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.invalid_account.description);
    expect(container.innerHTML).not.toContain("SSECRETSEED");
  });
  it("shows direct and muxed groups with bounded coverage", async () => {
    const { user } = renderFeature(<MuxedPaymentRoutingAuditPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), baseAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.coverageTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.directGroup)).toBeInTheDocument();
    expect(screen.getByText(copy.muxedGroup("7"))).toBeInTheDocument();
    expect(screen.getByText(copy.muxedGroup("9"))).toBeInTheDocument();
  });
  it("shows actionable not-found copy", async () => {
    const { user } = renderFeature(<MuxedPaymentRoutingAuditPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), missingAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });
});
