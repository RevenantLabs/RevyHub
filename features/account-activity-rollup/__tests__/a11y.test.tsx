import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountActivityRollupPanel } from "@/features/account-activity-rollup/components/AccountActivityRollupPanel";
import { accountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";
import { copy } from "@/features/account-activity-rollup/copy";
import { handlers } from "@/features/account-activity-rollup/msw/handlers";

withMswHandlers(...handlers);
describe("AccountActivityRollupPanel accessibility", () => {
  it("has no WCAG 2.1 A/AA violations when idle", async () => {
    const { container } = renderFeature(<AccountActivityRollupPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG 2.1 A/AA violations when results are shown", async () => {
    const { container, user } = renderFeature(<AccountActivityRollupPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(`${copy.coveragePrefix} 20 ${copy.coverageSuffix} 1 ${copy.coveragePage}.`);
    await expectNoAxeViolations(container);
  }, 15_000);
});
