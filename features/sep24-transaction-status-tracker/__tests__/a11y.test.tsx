import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { Sep24TransactionStatusTrackerPanel } from "@/features/sep24-transaction-status-tracker/components/Sep24TransactionStatusTrackerPanel";
import { copy } from "@/features/sep24-transaction-status-tracker/copy";
import { handlers } from "@/features/sep24-transaction-status-tracker/msw/handlers";
import {
  homeDomain,
  liveToken,
  transactionId
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

withMswHandlers(...handlers);

describe("Sep24TransactionStatusTrackerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep24TransactionStatusTrackerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a status check", async () => {
    const { container, user } = renderFeature(<Sep24TransactionStatusTrackerPanel />);
    await user.type(screen.getByLabelText(copy.domainLabel), homeDomain);
    await user.type(screen.getByLabelText(copy.transactionLabel), transactionId);
    await user.type(screen.getByLabelText(copy.tokenLabel), liveToken);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
