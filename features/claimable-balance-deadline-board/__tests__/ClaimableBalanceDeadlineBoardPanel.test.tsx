import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ClaimableBalanceDeadlineBoardPanel } from "../components/ClaimableBalanceDeadlineBoardPanel";
import { copy, errorCopy } from "../copy";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
describe("panel", () => {
  it("shows guidance and a field error without echoing secret input in result", async () => {
    const { user } = renderFeature(<ClaimableBalanceDeadlineBoardPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await user.click(screen.getByLabelText(copy.claimantLabel));
    await user.paste("S" + "x".repeat(55));
    expect(screen.getByLabelText(copy.claimantLabel)).toHaveValue("");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(screen.getByText(errorCopy.invalid_claimant.description)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.claimantLabel)).toHaveValue("");
  });
  it("renders dated and indeterminate sections with fetched page count", async () => {
    const { user } = renderFeature(<ClaimableBalanceDeadlineBoardPanel />);
    await user.type(screen.getByLabelText(copy.claimantLabel), claimant);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.pages(1))).toBeInTheDocument();
    expect(screen.getByRole("region", { name: copy.datedTitle })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: copy.undatedTitle })).toBeInTheDocument();
  });
  it("does not keep a secret key pasted into the cursor", async () => {
    const { user } = renderFeature(<ClaimableBalanceDeadlineBoardPanel />);
    await user.click(screen.getByLabelText(copy.cursorLabel));
    await user.paste("S" + "x".repeat(55));
    expect(screen.getByLabelText(copy.cursorLabel)).toHaveValue("");
  });
});
