import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";
import { copy } from "@/features/account-merge-preflight/copy";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";
import {
  destinationAccountId,
  sourceAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";

withMswHandlers(...handlers);

describe("AccountMergePreflightPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AccountMergePreflightPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a field error", async () => {
    const { container, user } = renderFeature(<AccountMergePreflightPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a complete result", async () => {
    const { container, user } = renderFeature(<AccountMergePreflightPanel />);
    await user.type(screen.getByLabelText(copy.sourceLabel), sourceAccountId);
    await user.type(screen.getByLabelText(copy.destinationLabel), destinationAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.mergeableTitle);
    await expectNoAxeViolations(container);
  });
});
