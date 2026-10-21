import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { MemoRequiredCheckerPanel } from "@/features/memo-required-checker/components/MemoRequiredCheckerPanel";
import { copy } from "@/features/memo-required-checker/copy";
import { handlers } from "@/features/memo-required-checker/msw/handlers";
import { accountId } from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";

withMswHandlers(...handlers);

describe("MemoRequiredCheckerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<MemoRequiredCheckerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<MemoRequiredCheckerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows both requiring sources", async () => {
    const { user } = renderFeature(<MemoRequiredCheckerPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.verdictRequired)).toBeInTheDocument();
    expect(screen.getByText(copy.bestEffortTitle)).toBeInTheDocument();
  });
});
