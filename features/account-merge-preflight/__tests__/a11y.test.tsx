import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";
import { copy } from "@/features/account-merge-preflight/copy";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";
import { sourceId, destinationId } from "@/features/account-merge-preflight/fixtures/account-merge-preflight.fixture";

withMswHandlers(...handlers);

describe("AccountMergePreflight accessibility", () => {
  it("has no WCAG A/AA violations in empty state", async () => {
    const { container } = renderFeature(<AccountMergePreflightPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a result rendered", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<AccountMergePreflightPanel />);

    await user.type(screen.getByLabelText(copy.formSourceLabel), sourceId);
    await user.type(screen.getByLabelText(copy.formDestinationLabel), destinationId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await screen.findByText(copy.mergeableTitle);
    await expectNoAxeViolations(container);
  });
});
