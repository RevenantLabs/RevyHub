import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ClaimableBalanceDeadlineBoardPanel } from "../components/ClaimableBalanceDeadlineBoardPanel";
import { copy } from "../copy";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
describe("deadline board accessibility", () => {
  it("has no WCAG 2.1 A/AA violations when idle", async () => {
    const { container } = renderFeature(<ClaimableBalanceDeadlineBoardPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG 2.1 A/AA violations with results", async () => {
    const { container, user } = renderFeature(<ClaimableBalanceDeadlineBoardPanel />);
    await user.type(screen.getByLabelText(copy.claimantLabel), claimant);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.pages(1));
    await expectNoAxeViolations(container);
  });
});
