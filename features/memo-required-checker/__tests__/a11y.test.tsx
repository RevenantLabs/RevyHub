import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { MemoRequiredCheckerPanel } from "@/features/memo-required-checker/components/MemoRequiredCheckerPanel";
import { copy } from "@/features/memo-required-checker/copy";
import { handlers } from "@/features/memo-required-checker/msw/handlers";
import { accountId } from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";

withMswHandlers(...handlers);

describe("MemoRequiredCheckerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<MemoRequiredCheckerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after a successful check", async () => {
    const { container, user } = renderFeature(<MemoRequiredCheckerPanel />);
    await user.type(screen.getByLabelText(copy.accountLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
