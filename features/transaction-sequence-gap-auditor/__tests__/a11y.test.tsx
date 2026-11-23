import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { TransactionSequenceGapAuditorPanel } from "@/features/transaction-sequence-gap-auditor/components/TransactionSequenceGapAuditorPanel";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";
import { accountId } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";
import { handlers } from "@/features/transaction-sequence-gap-auditor/msw/handlers";

withMswHandlers(...handlers);

describe("TransactionSequenceGapAuditorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after success", async () => {
    const { container, user } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.overviewTitle);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after validation failure", async () => {
    const { container, user } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });
});
