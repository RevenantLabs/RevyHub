import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
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

describe("Sep24TransactionStatusTrackerPanel", () => {
  it("renders the empty state and the token warning", () => {
    renderFeature(<Sep24TransactionStatusTrackerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.jwtWarningTitle, { exact: false })).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<Sep24TransactionStatusTrackerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows the pending deposit next step", async () => {
    const { user } = renderFeature(<Sep24TransactionStatusTrackerPanel />);
    await user.type(screen.getByLabelText(copy.domainLabel), homeDomain);
    await user.type(screen.getByLabelText(copy.transactionLabel), transactionId);
    await user.type(screen.getByLabelText(copy.tokenLabel), liveToken);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText("pending_external")).toBeInTheDocument();
    expect(screen.queryByText(liveToken)).not.toBeInTheDocument();
  });
});
