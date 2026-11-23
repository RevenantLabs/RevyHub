import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { TransactionSequenceGapAuditorPanel } from "@/features/transaction-sequence-gap-auditor/components/TransactionSequenceGapAuditorPanel";
import { copy, errorCopy } from "@/features/transaction-sequence-gap-auditor/copy";
import { accountId } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";
import {
  handlers,
  incompleteWindowHandlers
} from "@/features/transaction-sequence-gap-auditor/msw/handlers";

const server = withMswHandlers(...handlers);

describe("TransactionSequenceGapAuditorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TransactionSequenceGapAuditorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
  });

  it("renders a valid Horizon result", async () => {
    const { user } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.overviewTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.noGaps)).toBeInTheDocument();
  });

  it("announces incomplete evidence", async () => {
    server.use(...incompleteWindowHandlers);
    const { user } = renderFeature(<TransactionSequenceGapAuditorPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
  });
});
