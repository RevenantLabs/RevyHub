import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TransactionFeeChargeAuditPanel } from "@/features/transaction-fee-charge-audit/components/TransactionFeeChargeAuditPanel";
import { copy } from "@/features/transaction-fee-charge-audit/copy";
import { handlers } from "@/features/transaction-fee-charge-audit/msw/handlers";
import { classicHash } from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";

withMswHandlers(...handlers);

describe("TransactionFeeChargeAuditPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionFeeChargeAuditPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a completed fee audit", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), classicHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });
});
